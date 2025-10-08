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
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<object>>> Login([FromBody] LoginDto dto)
        {
            try
            {
                var user = await _userRepository.GetByPhoneAsync(dto.PhoneNumber);

                if (user == null)
                {
                    return Unauthorized(ApiResponse<object>.ErrorResult("User not found"));
                }

                var hashedInput = PasswordHelper.HashPassword(dto.Password);

                if (user.PasswordHash != hashedInput)
                {
                    return Unauthorized(ApiResponse<object>.ErrorResult("Invalid password"));
                }

                var data = new
                {
                    token = "dummy-jwt-token",
                    userId = user.UserId,
                    fullName = user.FullName,
                    phone = user.Phone

                };

                return Ok(ApiResponse<object>.SuccessResult(data, "Login success"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while login");
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error during login", ex.Message));
            }
        }

        /// <summary>
        /// Đăng ký tài khoản mới
        /// </summary>
        [HttpPost("register")]
public async Task<ActionResult<ApiResponse<object>>> Register([FromBody] RegisterDto dto)
{
    try
    {
        // Kiểm tra trùng lặp theo Phone hoặc FullName
        var exists = await _userRepository.ExistsByPhoneOrFullNameAsync(dto.PhoneNumber, dto.FullName);
        if (exists)
        {
            return BadRequest(ApiResponse<object>.ErrorResult("IDENTITY HAD ALREADY EXISTED"));
        }

        var user = new User
        {
            UserId = Guid.NewGuid(),
            FullName = dto.FullName,
            Phone = dto.PhoneNumber,
            
            PasswordHash = PasswordHelper.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow,
            Status = "1",
            RoleId = Guid.Parse("D4A49C9E-DF1D-4CBB-A1A6-816FB453E5BD")
        };

        await _userRepository.AddAsync(user);

        var data = new
        {
            token = "dummy-jwt-token",
            userId = user.UserId,
            fullName = user.FullName,
            phone = user.Phone
        };

        return Ok(ApiResponse<object>.SuccessResult(data, "Register success"));
    }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Register error: {Message}", ex.InnerException?.Message ?? ex.Message);
                return StatusCode(500, ApiResponse<object>.ErrorResult(
                    "Internal server error during registration",
                    ex.InnerException?.Message ?? ex.Message
                ));
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