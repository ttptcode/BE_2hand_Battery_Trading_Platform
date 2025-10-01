using Microsoft.AspNetCore.Http;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
using Microsoft.AspNetCore.Identity.Data;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserRepository userRepository, ILogger<AuthController> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                // Kiểm tra trùng lặp (Email hoặc FullName đã tồn tại)
                var exists = await _userRepository.ExistsByEmailOrFullNameAsync(dto.Email, dto.FullName);
                if (exists)
                {
                    return BadRequest(new { message = "IDENTITY HAD ALREADY EXISTED" });
                }

                var user = new User
                {
                    UserId = Guid.NewGuid(),
                    FullName = dto.FullName,
                    Email = dto.Email,
                    Phone = dto.PhoneNumber,
                    PasswordHash = PasswordHelper.HashPassword(dto.Password), // dùng SHA256 helper
                    CreatedAt = DateTime.UtcNow,
                    Status = "Active"
                };

                await _userRepository.AddAsync(user);

                // FE đang check response.token => trả dummy token
                return Ok(new
                {
                    token = "dummy-jwt-token",
                    message = "Register success"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Register error");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
        //[HttpPost("forgot-password/send-otp")]
        //public IActionResult SendOtp([FromBody] ForgotPasswordRequest request)
        //{
        //    // Tạo OTP giả (FE chỉ cần response là ok)
        //    var otp = "123456";

        //    // Ở đây bạn có thể gửi email thực, nhưng để test thì hardcode
        //    return Ok(new { message = "OTP sent successfully", otp = otp });
        //}

        //[HttpPost("forgot-password/reset")]
        //public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        //{
        //    if (request.NewPassword != request.ConfirmPassword)
        //    {
        //        return BadRequest(new { message = "Passwords do not match" });
        //    }

        //    // TODO: validate OTP từ DB hoặc cache
        //    if (request.Otp != "123456")
        //    {
        //        return BadRequest(new { message = "Invalid OTP" });
        //    }

        //    var user = await _userRepository.GetByEmailAsync(request.Email);
        //    if (user == null)
        //    {
        //        return NotFound(new { message = "User not found" });
        //    }

        //    user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
        //    user.UpdatedAt = DateTime.UtcNow;
        //    await _userRepository.UpdateAsync(user);

        //    return Ok(new { message = "Password reset successfully" });
        //}
    }
}