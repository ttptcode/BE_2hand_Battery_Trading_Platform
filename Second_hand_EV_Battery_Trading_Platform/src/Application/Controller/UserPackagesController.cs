using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
public class UserPackagesController : ControllerBase
{
    private readonly IUserPackageService _userPackageService;

    public UserPackagesController(IUserPackageService userPackageService)
    {
        _userPackageService = userPackageService;
    }

    /// <summary>
    /// Mua gói từ FeeCommission
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <param name="request">Thông tin gói cần mua</param>
    /// <returns>Thông tin gói đã mua</returns>
    [HttpPost("/purchase")]
    public async Task<ActionResult<ApiResponse<UserPackageResponse>>> PurchasePackage(
        [FromBody] PurchasePackageRequest request)
    {
        var result = await _userPackageService.PurchasePackageAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách tất cả gói của user
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <returns>Danh sách gói của user</returns>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ApiResponse<List<UserPackageResponse>>>> GetUserPackages(Guid userId)
    {
        var result = await _userPackageService.GetUserPackagesAsync(userId);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách gói đang hoạt động của user
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <returns>Danh sách gói đang hoạt động</returns>
    [HttpGet("{userId}/active")]
    public async Task<ActionResult<ApiResponse<List<UserPackageResponse>>>> GetActiveUserPackages(Guid userId)
    {
        var result = await _userPackageService.GetActiveUserPackagesAsync(userId);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết một gói của user
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <param name="feeId">ID của fee package</param>
    /// <returns>Thông tin chi tiết gói</returns>
    [HttpGet("{userId}/{feeId}")]
    public async Task<ActionResult<ApiResponse<UserPackageResponse>>> GetUserPackage(Guid userId, Guid feeId)
    {
        var result = await _userPackageService.GetUserPackageAsync(userId, feeId);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }

    /// <summary>
    /// Sử dụng một listing từ gói
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <param name="feeId">ID của fee package</param>
    /// <returns>Kết quả sử dụng listing</returns>
    [HttpPost("{userId}/{feeId}/consume-listing")]
    public async Task<ActionResult<ApiResponse<bool>>> ConsumeListing(Guid userId, Guid feeId)
    {
        var result = await _userPackageService.ConsumeListingAsync(userId, feeId);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }

    /// <summary>
    /// Lấy số lượng listing còn lại trong gói
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <param name="feeId">ID của fee package</param>
    /// <returns>Số lượng listing còn lại</returns>
    [HttpGet("{userId}/{feeId}/remaining-listings")]
    public async Task<ActionResult<ApiResponse<int>>> GetRemainingListings(Guid userId, Guid feeId)
    {
        var result = await _userPackageService.GetRemainingListingsAsync(userId, feeId);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
}
