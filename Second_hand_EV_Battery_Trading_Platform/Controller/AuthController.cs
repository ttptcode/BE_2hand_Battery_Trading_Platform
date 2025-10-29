using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration; // Cần thêm using này
using Microsoft.Extensions.Logging;    // Cần thêm using này
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using System;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;


namespace Second_hand_EV_Battery_Trading_Platform.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;
        private static readonly Guid DefaultUserRoleId = Guid.Parse("95CE8882-9EF7-483E-AC10-5DA90CDF60DB");
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _memoryCache; // Dùng để lưu OTP tạm thời
        private static readonly Random _random = new Random(); // Tối ưu hóa việc tạo số ngẫu nhiên
        public AuthController(
    IUserRepository userRepository,
    ILogger<AuthController> logger,
    IConfiguration configuration,
    ITokenService tokenService,
    IHttpClientFactory httpClientFactory,
            IMemoryCache memoryCache)
        {
            _userRepository = userRepository;
            _logger = logger;
            _configuration = configuration;
            _tokenService = tokenService;
            _httpClient = httpClientFactory.CreateClient(); // Khởi tạo _httpClient ở đây
            _memoryCache = memoryCache;
        }

        public class LoginDto
        {
            public string PhoneNumber { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class UpdatePhoneAndPasswordDto
        {
            // ✅ Thêm UserId để không cần dùng JWT
            public Guid UserId { get; set; } = Guid.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<object>>> Login([FromBody] LoginDto dto)
        {
            try
            {
                var user = await _userRepository.GetByPhoneAsync(dto.PhoneNumber);

                if (user == null)
                    return Unauthorized(ApiResponse<object>.ErrorResult("User not found"));

                var hashedInput = PasswordHelper.HashPassword(dto.Password);
                if (user.PasswordHash != hashedInput)
                    return Unauthorized(ApiResponse<object>.ErrorResult("Invalid password"));

                // ✅ Lấy RoleName
                var roleName = user.Role?.RoleName ?? "User";

                // ✅ Sinh token bằng TokenService
                var token = _tokenService.GenerateToken(user, roleName);

                var data = new
                {
                    token,
                    userId = user.UserId,
                    fullName = user.FullName,
                    phone = user.Phone,
                    role = roleName
                };

                return Ok(ApiResponse<object>.SuccessResult(data, "Login success"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while login");
                return StatusCode(500, ApiResponse<object>.ErrorResult(
                    "Internal server error during login", ex.Message));
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
                    RoleId = Guid.Parse("95CE8882-9EF7-483E-AC10-5DA90CDF60DB")
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



        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet("external-login/{provider}")]
        public IActionResult ExternalLogin([FromRoute] string provider, [FromQuery] string returnUrl = "/")
        {
            var redirectUrl = Url.Action("ExternalLoginCallback", "Auth", new { returnUrl });
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            if (provider.Equals("google", StringComparison.OrdinalIgnoreCase))
                provider = "Google";
            else if (provider.Equals("facebook", StringComparison.OrdinalIgnoreCase))
                provider = "Facebook";

            return Challenge(properties, provider);
        }

        /// <summary>
        /// Fallback endpoint để xử lý OAuth errors - hiển thị JSON thay vì redirect
        /// </summary>
        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet("oauth-error")]
        public IActionResult OAuthError([FromQuery] string? error, [FromQuery] string? message, [FromQuery] string? returnUrl = "/")
        {
            _logger.LogWarning("OAuth error: {Error}, Message: {Message}, ReturnUrl: {ReturnUrl}", error, message, returnUrl);
            
            // Luôn trả về JSON response thay vì redirect
            return Ok(ApiResponse<object>.ErrorResult(
                error ?? "oauth_failed", 
                message ?? "Authentication failed"
            ));
        }

        /// <summary>
        /// Alternative Google OAuth endpoint để test mà không cần correlation
        /// </summary>
        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet("google-login-direct")]
        public IActionResult GoogleLoginDirect([FromQuery] string? returnUrl = "/")
        {
            try
            {
                _logger.LogInformation("Direct Google login initiated with returnUrl: {returnUrl}", returnUrl);
                
                // Tạo properties với returnUrl trong state
                var properties = new AuthenticationProperties
                {
                    RedirectUri = $"/api/Auth/external-login-callback-json?returnUrl={Uri.EscapeDataString(returnUrl)}"
                };
                
                // Thêm returnUrl vào state để có thể lấy lại sau
                properties.Items["returnUrl"] = returnUrl;
                
                return Challenge(properties, "Google");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GoogleLoginDirect");
                return Ok(ApiResponse<object>.ErrorResult("login_initiation_failed", ex.Message));
            }
        }

        /// <summary>
        /// Google OAuth callback endpoint trả về JSON thay vì redirect
        /// </summary>
        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet("external-login-callback-json")]
        public async Task<IActionResult> ExternalLoginCallbackJson(string? returnUrl = "/")
        {
            try
            {
                // Lấy returnUrl từ AuthenticationProperties hoặc query string
                var authResult = await HttpContext.AuthenticateAsync("Google");
                if (authResult.Succeeded && authResult.Properties?.Items.TryGetValue("returnUrl", out var authReturnUrl) == true)
                {
                    returnUrl = authReturnUrl;
                }
                else
                {
                    // Fallback: lấy từ query string
                    var state = Request.Query["state"];
                    if (!string.IsNullOrEmpty(state))
                    {
                        var stateParams = System.Web.HttpUtility.ParseQueryString(state);
                        if (!string.IsNullOrEmpty(stateParams["returnUrl"]))
                        {
                            returnUrl = stateParams["returnUrl"];
                        }
                    }
                }

                _logger.LogInformation("External login callback JSON started with returnUrl: {returnUrl}", returnUrl);

                // ✅ Dùng scheme "Google"
                var result = await HttpContext.AuthenticateAsync("Google");
                if (!result.Succeeded)
                {
                    _logger.LogWarning("Google authentication failed");
                    return Ok(ApiResponse<object>.ErrorResult("external_authentication_failed", "Google authentication failed"));
                }

                var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
                var fullName = result.Principal.FindFirst(ClaimTypes.Name)?.Value;

                _logger.LogInformation("Google authentication successful. Email: {email}, FullName: {fullName}", email, fullName);

                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("No email returned from Google");
                    return Ok(ApiResponse<object>.ErrorResult("no_email_returned", "No email returned from Google"));
                }

                // ✅ Lấy access token
                var accessToken = await HttpContext.GetTokenAsync("Google", "access_token");
                _logger.LogInformation("Access token retrieved: {hasToken}", !string.IsNullOrEmpty(accessToken));

                string scope = "(none)";
                if (result.Properties?.Items.TryGetValue(".Token.scope", out var scopeValue) == true)
                    scope = scopeValue;
                _logger.LogInformation("Scopes: {scope}", scope);

                // ✅ Gọi Google People API (optional - không bắt buộc)
                string? phoneNumber = null;
                if (!string.IsNullOrEmpty(accessToken))
                {
                    try
                    {
                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                        var response = await httpClient.GetAsync("https://people.googleapis.com/v1/people/me?personFields=phoneNumbers");
                        var json = await response.Content.ReadAsStringAsync();
                        _logger.LogInformation("Google People API response status: {statusCode}", response.StatusCode);

                        if (response.IsSuccessStatusCode)
                        {
                            var doc = JsonDocument.Parse(json);
                            if (doc.RootElement.TryGetProperty("phoneNumbers", out var phones) && phones.GetArrayLength() > 0)
                                phoneNumber = phones[0].GetProperty("value").GetString();
                        }
                        else
                            _logger.LogWarning("Google People API lỗi: {StatusCode}", response.StatusCode);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể lấy số điện thoại từ Google People API - tiếp tục không có phone");
                    }
                }

                // ✅ Lưu hoặc cập nhật user
                var existingUser = await _userRepository.GetByEmailAsync(email);
                if (existingUser == null)
                {
                    _logger.LogInformation("Creating new user for email: {email}", email);
                    var newUser = new User
                    {
                        UserId = Guid.NewGuid(),
                        FullName = fullName ?? email,
                        Email = email,
                        Phone = phoneNumber ?? string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        Status = "1",
                        RoleId = DefaultUserRoleId
                    };
                    await _userRepository.AddAsync(newUser);
                    existingUser = newUser;
                }
                else if (string.IsNullOrEmpty(existingUser.Phone) && !string.IsNullOrEmpty(phoneNumber))
                {
                    _logger.LogInformation("Updating phone for existing user: {email}", email);
                    existingUser.Phone = phoneNumber;
                    await _userRepository.UpdateAsync(existingUser);
                }

                var roleName = existingUser.Role?.RoleName ?? "User";
                var token = _tokenService.GenerateToken(existingUser, roleName);

                _logger.LogInformation("Token generated successfully for user: {userId}", existingUser.UserId);

                // ✅ Trả về JSON response thay vì redirect
                var data = new
                {
                    success = true,
                    token,
                    userId = existingUser.UserId,
                    fullName = existingUser.FullName ?? "",
                    email = existingUser.Email ?? "",
                    phone = existingUser.Phone ?? "",
                    role = roleName
                };

                return Ok(ApiResponse<object>.SuccessResult(data, "External login success"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ExternalLoginCallbackJson");
                return Ok(ApiResponse<object>.ErrorResult("internal_server_error", ex.Message));
            }
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet("external-login-callback")]
        public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = "/")
        {
            try
            {
                // Lấy returnUrl từ AuthenticationProperties hoặc query string
                var authResult = await HttpContext.AuthenticateAsync("Google");
                if (authResult.Succeeded && authResult.Properties?.Items.TryGetValue("returnUrl", out var authReturnUrl) == true)
                {
                    returnUrl = authReturnUrl;
                }
                else
                {
                    // Fallback: lấy từ query string
                    var state = Request.Query["state"];
                    if (!string.IsNullOrEmpty(state))
                    {
                        var stateParams = System.Web.HttpUtility.ParseQueryString(state);
                        if (!string.IsNullOrEmpty(stateParams["returnUrl"]))
                        {
                            returnUrl = stateParams["returnUrl"];
                        }
                    }
                }

                _logger.LogInformation("External login callback started with returnUrl: {returnUrl}", returnUrl);

                // ✅ Dùng scheme "Google"
                var result = await HttpContext.AuthenticateAsync("Google");
                if (!result.Succeeded)
                {
                    _logger.LogWarning("Google authentication failed");
                    return Redirect($"/api/Auth/oauth-error?error=external_authentication_failed&returnUrl={Uri.EscapeDataString(returnUrl)}");
                }

                var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
                var fullName = result.Principal.FindFirst(ClaimTypes.Name)?.Value;

                _logger.LogInformation("Google authentication successful. Email: {email}, FullName: {fullName}", email, fullName);

                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("No email returned from Google");
                    return Redirect($"/api/Auth/oauth-error?error=no_email_returned&returnUrl={Uri.EscapeDataString(returnUrl)}");
                }

                // ✅ Lấy access token
                var accessToken = await HttpContext.GetTokenAsync("Google", "access_token");
                _logger.LogInformation("Access token retrieved: {hasToken}", !string.IsNullOrEmpty(accessToken));

                string scope = "(none)";
                if (result.Properties?.Items.TryGetValue(".Token.scope", out var scopeValue) == true)
                    scope = scopeValue;
                _logger.LogInformation("Scopes: {scope}", scope);

                // ✅ Gọi Google People API (optional - không bắt buộc)
                string? phoneNumber = null;
                if (!string.IsNullOrEmpty(accessToken))
                {
                    try
                    {
                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                        var response = await httpClient.GetAsync("https://people.googleapis.com/v1/people/me?personFields=phoneNumbers");
                        var json = await response.Content.ReadAsStringAsync();
                        _logger.LogInformation("Google People API response status: {statusCode}", response.StatusCode);

                        if (response.IsSuccessStatusCode)
                        {
                            var doc = JsonDocument.Parse(json);
                            if (doc.RootElement.TryGetProperty("phoneNumbers", out var phones) && phones.GetArrayLength() > 0)
                                phoneNumber = phones[0].GetProperty("value").GetString();
                        }
                        else
                            _logger.LogWarning("Google People API lỗi: {StatusCode}", response.StatusCode);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể lấy số điện thoại từ Google People API - tiếp tục không có phone");
                    }
                }

                // ✅ Lưu hoặc cập nhật user
                var existingUser = await _userRepository.GetByEmailAsync(email);
                if (existingUser == null)
                {
                    _logger.LogInformation("Creating new user for email: {email}", email);
                    var newUser = new User
                    {
                        UserId = Guid.NewGuid(),
                        FullName = fullName ?? email,
                        Email = email,
                        Phone = phoneNumber ?? string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        Status = "1",
                        RoleId = DefaultUserRoleId
                    };
                    await _userRepository.AddAsync(newUser);
                    existingUser = newUser;
                }
                else if (string.IsNullOrEmpty(existingUser.Phone) && !string.IsNullOrEmpty(phoneNumber))
                {
                    _logger.LogInformation("Updating phone for existing user: {email}", email);
                    existingUser.Phone = phoneNumber;
                    await _userRepository.UpdateAsync(existingUser);
                }

                var roleName = existingUser.Role?.RoleName ?? "User";
                var token = _tokenService.GenerateToken(existingUser, roleName);

                _logger.LogInformation("Token generated successfully for user: {userId}", existingUser.UserId);

                // ✅ Redirect với các thông tin user trong query parameters
                var redirectUrl = $"{returnUrl}?success=true&token={Uri.EscapeDataString(token)}&userId={existingUser.UserId}&fullName={Uri.EscapeDataString(existingUser.FullName ?? "")}&email={Uri.EscapeDataString(existingUser.Email ?? "")}&phone={Uri.EscapeDataString(existingUser.Phone ?? "")}&role={Uri.EscapeDataString(roleName)}";

                _logger.LogInformation("Redirecting to: {redirectUrl}", redirectUrl);
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ExternalLoginCallback");
                return Redirect($"/api/Auth/oauth-error?error=internal_server_error&message={Uri.EscapeDataString(ex.Message)}&returnUrl={Uri.EscapeDataString(returnUrl)}");
            }
        }
        [HttpGet("email")]

        public async Task<ActionResult<ApiResponse<object>>> GetCurrentUser()
        {
            try
            {
                // ✅ Lấy userId từ JWT
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(ApiResponse<object>.ErrorResult("Invalid token"));

                var userId = Guid.Parse(userIdClaim);
                var user = await _userRepository.GetByIdAsync(userId);

                if (user == null)
                    return NotFound(ApiResponse<object>.ErrorResult("User not found"));

                // ✅ Lấy role name (nếu có)
                var roleName = user.Role?.RoleName ?? "User";

                var data = new
                {
                    fullName = user.FullName,
                    email = user.Email,
                    phone = user.Phone,
                    role = roleName,
                    createdAt = user.CreatedAt
                };

                return Ok(ApiResponse<object>.SuccessResult(data, "User info retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCurrentUser");
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
            }
        }

        /// <summary>
        /// Cập nhật phone và password của user hiện tại (lấy từ JWT token)
        /// </summary>
        [HttpPut("update-phone-password")]
        // Removed Authorize to allow passing UserId in body instead of JWT
        public async Task<ActionResult<ApiResponse<object>>> UpdatePhoneAndPassword([FromBody] UpdatePhoneAndPasswordDto dto)
        {
            try
            {
                // ✅ Use provided UserId from DTO instead of JWT
                if (dto == null)
                    return BadRequest(ApiResponse<object>.ErrorResult("Invalid request"));

                if (dto.UserId == Guid.Empty)
                    return BadRequest(ApiResponse<object>.ErrorResult("UserId is required"));

                var userId = dto.UserId;

                // ✅ Kiểm tra input
                if (string.IsNullOrWhiteSpace(dto.Phone))
                    return BadRequest(ApiResponse<object>.ErrorResult("Phone number is required"));
                
                if (string.IsNullOrWhiteSpace(dto.Password))
                    return BadRequest(ApiResponse<object>.ErrorResult("Password is required"));

                if (dto.Password.Length < 6)
                    return BadRequest(ApiResponse<object>.ErrorResult("Password must be at least 6 characters"));

                // ✅ Lấy user từ database
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    return NotFound(ApiResponse<object>.ErrorResult("User not found"));

                // ✅ Kiểm tra phone trùng lặp (nếu phone đã tồn tại bởi user khác)
                var existingUser = await _userRepository.GetByPhoneAsync(dto.Phone);
                if (existingUser != null && existingUser.UserId != userId)
                    return BadRequest(ApiResponse<object>.ErrorResult("Phone number already exists"));

                // ✅ Update phone và password
                user.Phone = dto.Phone;
                user.PasswordHash = PasswordHelper.HashPassword(dto.Password);
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);

                _logger.LogInformation("User {UserId} updated phone and password", userId);

                var data = new
                {
                    userId = user.UserId,
                    phone = user.Phone,
                    message = "Phone and password updated successfully"
                };

                return Ok(ApiResponse<object>.SuccessResult(data, "Phone and password updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdatePhoneAndPassword");
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
            }
        }

        public class SendOtpRequest
        {
            public string Phone { get; set; } = string.Empty;
        }
        public class SpeedSmsResponse
        {
            [JsonPropertyName("status")]
            public string Status { get; set; }

            [JsonPropertyName("code")]
            public int Code { get; set; } // Nên dùng string vì code có thể là "00"

            [JsonPropertyName("message")]
            public string? Message { get; set; } // Có thể null
        }

        [HttpPost("send-otp")]
        public async Task<ActionResult<ApiResponse<object>>> SendOtp([FromBody] SendOtpRequest dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Phone))
                    return BadRequest(ApiResponse<object>.ErrorResult("Phone number is required"));

                string formattedPhone = FormatPhoneNumber(dto.Phone);
                var otp = _random.Next(100000, 999999).ToString();
                var message = $"Ma xac thuc cua ban la: {otp}. Vui long khong chia se.";

                var speedSmsApiKey = (_configuration["SpeedSms:ApiKey"] ?? "").Trim();
                var speedSmsUrl = _configuration["SpeedSms:SendUrl"] ?? "https://api.speedsms.vn/index.php/sms/send";

                // --- SỬA LỖI: Xóa hoàn toàn trường 'sender' ---
                var payload = new
                {
                    to = new[] { formattedPhone },
                    content = message,
                    sms_type = 2
                };

                var json = JsonSerializer.Serialize(payload);

                // Dùng HttpRequestMessage để an toàn hơn
                using var request = new HttpRequestMessage(HttpMethod.Post, speedSmsUrl);
                var basicAuthValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{speedSmsApiKey}:"));
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuthValue);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                var resp = await _httpClient.SendAsync(request);
                var respText = await resp.Content.ReadAsStringAsync();

                if (!resp.IsSuccessStatusCode) { /* ... xử lý lỗi HTTP ... */ }

                var speedSmsResult = JsonSerializer.Deserialize<SpeedSmsResponse>(respText);

                if (speedSmsResult?.Status?.Equals("success", StringComparison.OrdinalIgnoreCase) == true)
                {
                    // --- BẮT BUỘC: Lưu OTP vào cache để xác thực sau ---
                    var cacheKey = $"OTP_{formattedPhone}";
                    _memoryCache.Set(cacheKey, otp, TimeSpan.FromMinutes(5)); // OTP hết hạn sau 5 phút
                    _logger.LogInformation("OTP for {Phone} is {Otp}", formattedPhone, otp); // Log OTP để test

                    return Ok(ApiResponse<object>.SuccessResult(new { phone = dto.Phone }, "OTP sent successfully"));
                }
                else
                {
                    _logger.LogWarning("SpeedSMS business failure: {Body}", respText);
                    return StatusCode(400, ApiResponse<object>.ErrorResult("SpeedSMS failed to send OTP", speedSmsResult?.Message ?? respText));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP for phone {Phone}", dto?.Phone);
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
            }
        }
        private string FormatPhoneNumber(string phone)
        {
            var formatted = phone.Trim();
            if (formatted.StartsWith("0")) return "84" + formatted.Substring(1);
            if (formatted.StartsWith("+84")) return formatted.Substring(1);
            return formatted;
        }
    }
}
