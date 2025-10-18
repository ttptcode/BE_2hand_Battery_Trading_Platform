using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{


    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        public AuthService(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        // Đăng ký
        public async Task<User?> RegisterAsync(RegisterRequest request)
        {
            // Check trùng bằng Phone hoặc FullName
            bool exists = await _userRepository.ExistsByPhoneOrFullNameAsync(request.PhoneNumber, request.FullName);
            if (exists) return null;

            var hashedPassword = PasswordHelper.HashPassword(request.Password);

            var user = new User
            {
                UserId = Guid.NewGuid(),
                FullName = request.FullName,  // map FE.fullName vào FullName
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
        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // 🔹 Lấy user kèm Role từ DB
            var user = await _userRepository.Query()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Phone == request.PhoneNumber);
            
            if (user == null)
                return null;
          
            // 🔹 Kiểm tra mật khẩu
            var hashedInput = PasswordHelper.HashPassword(request.Password);
            if (user.PasswordHash != hashedInput)
                return null;

            // 🔹 Lấy role name (nếu không có thì gán mặc định là "user")
            var roleName = user.Role?.RoleName ?? "user";

            // 🔹 Sinh token chứa claim role
            var token = _tokenService.GenerateToken(user, roleName);

            return new LoginResponse
            {
                Token = token,
                FullName = user.FullName,
                Phone = user.Phone,
                Role = roleName
            };
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