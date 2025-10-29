using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using System.Security.Claims;

namespace Second_hand_EV_Battery_Trading_Platform.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User")]
public class UserPackagesController : ControllerBase
{
    private readonly IUserPackageService _userPackageService;
    private readonly ILogger<UserPackagesController> _logger;

    public UserPackagesController(IUserPackageService userPackageService, ILogger<UserPackagesController> logger)
    {
        _userPackageService = userPackageService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy userId từ JWT token
    /// </summary>
    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.Name);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsed))
            return parsed;
        return null;
    }

    /// <summary>
    /// Mua gói từ FeeCommission
    /// </summary>
    /// <param name="request">Thông tin gói cần mua</param>
    /// <returns>Thông tin gói đã mua</returns>
    [HttpPost("purchase")]
    public async Task<ActionResult<ApiResponse<UserPackageResponse>>> PurchasePackage(
        [FromBody] PurchasePackageRequest request)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<UserPackageResponse>.ErrorResult("Unable to determine current user id"));

            var result = await _userPackageService.PurchasePackageAsync(currentUserId.Value, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while purchasing package");
            return StatusCode(500, ApiResponse<UserPackageResponse>.ErrorResult(
                "Internal server error while purchasing package",
                ex.Message));
        }
    }

    /// <summary>
    /// Lấy danh sách tất cả gói của user
    /// </summary>
    /// <returns>Danh sách gói của user</returns>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserPackageResponse>>>> GetUserPackages()
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<List<UserPackageResponse>>.ErrorResult("Unable to determine current user id"));

            var result = await _userPackageService.GetUserPackagesAsync(currentUserId.Value);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while getting user packages");
            return StatusCode(500, ApiResponse<List<UserPackageResponse>>.ErrorResult(
                "Internal server error while retrieving user packages",
                ex.Message));
        }
    }

    /// <summary>
    /// Lấy danh sách gói đang hoạt động của user
    /// </summary>
    /// <returns>Danh sách gói đang hoạt động</returns>
    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<List<UserPackageResponse>>>> GetActiveUserPackages()
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<List<UserPackageResponse>>.ErrorResult("Unable to determine current user id"));

            var result = await _userPackageService.GetActiveUserPackagesAsync(currentUserId.Value);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while getting active user packages");
            return StatusCode(500, ApiResponse<List<UserPackageResponse>>.ErrorResult(
                "Internal server error while retrieving active user packages",
                ex.Message));
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết một gói của user
    /// </summary>
    /// <param name="feeId">ID của fee package</param>
    /// <returns>Thông tin chi tiết gói</returns>
    [HttpGet("{feeId}")]
    public async Task<ActionResult<ApiResponse<UserPackageResponse>>> GetUserPackage(Guid feeId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<UserPackageResponse>.ErrorResult("Unable to determine current user id"));

            var result = await _userPackageService.GetUserPackageAsync(currentUserId.Value, feeId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while getting user package");
            return StatusCode(500, ApiResponse<UserPackageResponse>.ErrorResult(
                "Internal server error while retrieving user package",
                ex.Message));
        }
    }

    /// <summary>
    /// Sử dụng một listing từ gói
    /// </summary>
    /// <param name="feeId">ID của fee package</param>
    /// <returns>Kết quả sử dụng listing</returns>
    [HttpPost("{feeId}/consume-listing")]
    public async Task<ActionResult<ApiResponse<bool>>> ConsumeListing(Guid feeId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<bool>.ErrorResult("Unable to determine current user id"));

            var result = await _userPackageService.ConsumeListingAsync(currentUserId.Value, feeId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while consuming listing");
            return StatusCode(500, ApiResponse<bool>.ErrorResult(
                "Internal server error while consuming listing",
                ex.Message));
        }
    }

    /// <summary>
    /// Lấy số lượng listing còn lại trong gói
    /// </summary>
    /// <param name="feeId">ID của fee package</param>
    /// <returns>Số lượng listing còn lại</returns>
    [HttpGet("{feeId}/remaining-listings")]
    public async Task<ActionResult<ApiResponse<int>>> GetRemainingListings(Guid feeId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<int>.ErrorResult("Unable to determine current user id"));

            var result = await _userPackageService.GetRemainingListingsAsync(currentUserId.Value, feeId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while getting remaining listings");
            return StatusCode(500, ApiResponse<int>.ErrorResult(
                "Internal server error while retrieving remaining listings",
                ex.Message));
        }
    }
}
