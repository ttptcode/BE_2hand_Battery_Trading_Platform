using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{


    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;

        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // Đăng ký
        public async Task<User?> RegisterAsync(RegisterRequest request)
        {
            bool exists = await _userRepository.ExistsByEmailOrFullNameAsync(request.Email, request.Username);
            if (exists) return null;

            var hashedPassword = HashPassword(request.Password);

            var user = new User
            {
                UserId = Guid.NewGuid(),
                FullName = request.Username,  // map FE.username vào FullName trong DB
                Email = request.Email,
                Phone = request.PhoneNumber,
                PasswordHash = hashedPassword,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            await _userRepository.AddAsync(user);
            return user;
        }

        // Đăng nhập
        public async Task<User?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByFullNameAsync(request.Username)
                       ?? await _userRepository.GetByEmailAsync(request.Username);

            if (user == null) return null;

            if (!VerifyPassword(request.Password, user.PasswordHash!)) return null;

            return user;
        }

        // Hash mật khẩu
        private string HashPassword(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);

            byte[] hash = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 32);

            return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var parts = storedHash.Split('.');
            if (parts.Length != 2) return false;

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] hash = Convert.FromBase64String(parts[1]);

            byte[] enteredHash = KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 32);

            return CryptographicOperations.FixedTimeEquals(hash, enteredHash);
        }
    }
}