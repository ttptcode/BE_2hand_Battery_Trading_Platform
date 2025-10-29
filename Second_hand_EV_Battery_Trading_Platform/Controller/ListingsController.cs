using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using System.Net.Mime;

namespace Second_hand_EV_Battery_Trading_Platform.Controller;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly IBiddingService _biddingService;
    private readonly IListingService _listingService;
    private readonly ILogger<ListingsController> _logger;
    private readonly IWebHostEnvironment _env;

    public ListingsController(IBiddingService biddingService, IListingService listingService, ILogger<ListingsController> logger, IWebHostEnvironment env)
    {
        _biddingService = biddingService;
        _listingService = listingService;
        _logger = logger;
        _env = env;
    }

    [HttpPost("proxy-bid")]
    [Authorize(Roles = "User")]

    public async Task<ActionResult<ApiResponse<PlaceProxyBidResponseDto>>> PlaceProxyBid([FromBody] PlaceProxyBidRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<PlaceProxyBidResponseDto>.ErrorResult("Validation failed", errors));
        }

        try
        {
            var result = await _biddingService.PlaceProxyBidAsync(request);
            return Ok(ApiResponse<PlaceProxyBidResponseDto>.SuccessResult(result, "Proxy bid placed"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<PlaceProxyBidResponseDto>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<PlaceProxyBidResponseDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Tạo một listing mới (Bán ngay hoặc Đấu giá) và xử lý thanh toán (VIP/Post).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status201Created)]
    [Authorize(Roles = "User")]

    public async Task<ActionResult<ApiResponse<ListingResponseDto>>> Create([FromBody] CreateListingDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Validation failed", errors));
            }

            var created = await _listingService.CreateListingWithPaymentAsync(dto);
            // Không dùng CreatedAtAction (vì b? GET), tr? 201 tr?c ti?p:
            return StatusCode(201, ApiResponse<ListingResponseDto>.SuccessResult(created, "Listing created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating listing");
            return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Tạo Item và Listing cùng lúc với upload ảnh và video
    /// </summary>
    /// <remarks>
    /// Request: multipart/form-data
    /// - Item fields: serialNumber, itemTypeId, title, brand, model, year, mileage, batteryCapacity, capacity, cycles, condition, price, style, color, seat, batteryIncluded, weight, licensePlate, origin, fuel, gearbox
    /// - Listing fields: listingType, buyNowPrice, startPrice, bidIncrement, endDate, feeId, detail, address, warranty
    /// - Files: images (max 10, max 10MB each), video (max 1GB, optional)
    /// </remarks>
    [HttpPost("with-item")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status401Unauthorized)]
    [Authorize(Roles = "User")]
public async Task<ActionResult<ApiResponse<ListingResponseDto>>> CreateItemWithListing(
    [FromForm] CreateItemWithListingDto dto) // Chỉ còn một tham số
{
    try
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Validation failed", errors));
        }

        // Lấy file từ DTO
        var images = dto.Images;
        var video = dto.Video;

        // Validate images
        if (images != null && images.Count > 10)
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Maximum 10 images allowed"));

        // Lấy userId từ JWT token
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(ApiResponse<ListingResponseDto>.ErrorResult("Invalid or missing user ID in token"));
        }

        // Base URL to build absolute URLs
        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        // Validate video
        if (video != null)
        {
            var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm" };
            var fileExtension = Path.GetExtension(video.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Invalid video format. Allowed: mp4, avi, mov, wmv, flv, webm"));

            if (video.Length > 1024 * 1024 * 1024)
                return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Video file too large. Maximum size is 1GB"));
        }

        // Truyền dto, images, và video vào service
        var result = await _listingService.CreateItemWithListingAsync(userId, dto, baseUrl, webRootPath);
        return StatusCode(201, ApiResponse<ListingResponseDto>.SuccessResult(result, "Item, Listing, and files created successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Business logic error", ex.Message));
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating item with listing");
        return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error", ex.Message));
    }
}

    /// <summary>
    /// Lấy danh sách tất cả các listing.
    /// </summary>

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingResponseDto>>>> GetAllListings()
    {
        try
        {
            var listings = await _listingService.GetAllListingsAsync();
            return Ok(ApiResponse<IEnumerable<ListingResponseDto>>.SuccessResult(listings, "Listings retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all listings");
            return StatusCode(500, ApiResponse<IEnumerable<ListingResponseDto>>.ErrorResult("Internal server error occurred while retrieving listings", ex.Message));
        }
    }

    /// <summary>   
    /// Lấy thông tin chi tiết của một listing dựa trên ListingId.
    /// </summary>

    [HttpGet("{listingId}")]
    public async Task<ActionResult<ApiResponse<ListingResponseDto>>> GetListingById(Guid listingId)
    {
        try
        {
            var listing = await _listingService.GetListingByListingIdAsync(listingId);
            if (listing == null)
                return NotFound(ApiResponse<ListingResponseDto>.ErrorResult($"Listing with ID {listingId} not found"));

            return Ok(ApiResponse<ListingResponseDto>.SuccessResult(listing, "Listing retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting listing {ListingId}", listingId);
            return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error occurred while retrieving listing", ex.Message));
        }
    }


    /// <summary>
    ///  Lấy danh sách các listing được tạo bởi một user cụ thể dựa trên UserId.
    /// </summary>
    /// <param name="userId"></param>
    /// <returns></returns>
    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingResponseDto>>>> GetByUser(Guid userId)
    {
        try
        {
            var listings = await _listingService.GetListingsByUserIdAsync(userId);
            return Ok(ApiResponse<IEnumerable<ListingResponseDto>>.SuccessResult(listings, $"Listings for user {userId} retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting listings for user {UserId}", userId);
            return StatusCode(500, ApiResponse<IEnumerable<ListingResponseDto>>.ErrorResult("Internal server error occurred while retrieving listings by user", ex.Message));
        }
    }

    /// <summary>
    ///  Lấy danh sách các listing theo loại listing (Bán ngay hoặc Đấu giá).
    /// </summary>
    /// <param name="listingType"></param>
    /// <returns></returns>

    [HttpGet("by-type/{listingType}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingResponseDto>>>> GetByType(string listingType)
    {
        try
        {
            var listings = await _listingService.GetListingsByListingTypeAsync(listingType);
            return Ok(ApiResponse<IEnumerable<ListingResponseDto>>.SuccessResult(listings, $"Listings of type '{listingType}' retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting listings by type {Type}", listingType);
            return StatusCode(500, ApiResponse<IEnumerable<ListingResponseDto>>.ErrorResult("Internal server error occurred while retrieving listings by type", ex.Message));
        }
    }

    [HttpGet("by-item/{itemId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingResponseDto>>>> GetByItem(Guid itemId)
    {
        try
        {
            var listings = await _listingService.GetListingsByItemIdAsync(itemId);
            return Ok(ApiResponse<IEnumerable<ListingResponseDto>>.SuccessResult(listings, $"Listings for item {itemId} retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting listings by item {ItemId}", itemId);
            return StatusCode(500, ApiResponse<IEnumerable<ListingResponseDto>>.ErrorResult("Internal server error occurred while retrieving listings by item", ex.Message));
        }
    }


    /// <summary>
    /// Cập nhật thông tin của một listing dựa trên ListingId.
    /// </summary>
    [HttpPut("{listingId}")]
    [Authorize(Roles = "User")]

    public async Task<ActionResult<ApiResponse<ListingResponseDto>>> Update(Guid listingId, [FromBody] UpdateListingDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Validation failed", errors));
            }

            dto.ListingId = listingId;
            var updated = await _listingService.UpdateListingAsync(dto);

            if (updated == null)
                return NotFound(ApiResponse<ListingResponseDto>.ErrorResult($"Listing with ID {listingId} not found"));

            return Ok(ApiResponse<ListingResponseDto>.SuccessResult(updated, "Listing updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating listing {ListingId}", listingId);
            return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error occurred while updating listing", ex.Message));
        }
    }

    /// <summary>
    /// Chuyển đổi status của listing giữa Draft và Active
    /// </summary>
    [HttpPatch("{listingId}/toggle-status")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<ApiResponse<ListingResponseDto>>> ToggleStatus(Guid listingId)
    {
        try
        {
            var updated = await _listingService.ToggleListingStatusAsync(listingId);

            if (updated == null)
                return NotFound(ApiResponse<ListingResponseDto>.ErrorResult($"Listing with ID {listingId} not found"));

            return Ok(ApiResponse<ListingResponseDto>.SuccessResult(updated, $"Listing status toggled successfully to {updated.Status}"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling listing status {ListingId}", listingId);
            return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error occurred while toggling listing status", ex.Message));
        }
    }

    /// <summary>
    /// Chuyển đổi trạng thái kích hoạt của listing giữa Active và Inactive
    /// </summary>
    [HttpPatch("{listingId}/toggle-active")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<ApiResponse<ListingResponseDto>>> ToggleActiveStatus(Guid listingId)
    {
        try
        {
            var updated = await _listingService.ToggleListingActiveInactiveAsync(listingId);

            if (updated == null)
                return NotFound(ApiResponse<ListingResponseDto>.ErrorResult($"Listing with ID {listingId} not found"));

            return Ok(ApiResponse<ListingResponseDto>.SuccessResult(updated, $"Listing active/inactive status toggled successfully to {updated.Status}"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling listing active status {ListingId}", listingId);
            return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error occurred while toggling listing active status", ex.Message));
        }
    }

    /// <summary>
    /// xóa một listing dựa trên ListingId.
    /// </summary>
    /// <param name="listingId"></param>
    /// <returns></returns>
    [HttpDelete("{listingId}")]
    [Authorize(Roles = "User")]

    public async Task<ActionResult<ApiResponse>> Delete(Guid listingId)
    {
        try
        {
            var result = await _listingService.DeleteListingAsync(listingId);
            if (!result)
                return NotFound(ApiResponse.ErrorResult($"Listing with ID {listingId} not found"));

            return Ok(ApiResponse.SuccessResult("Listing deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting listing {ListingId}", listingId);
            return StatusCode(500, ApiResponse.ErrorResult("Internal server error occurred while deleting listing", ex.Message));
        }
    }

    /// <summary>
    /// Update cả Item và Listing cùng lúc với upload ảnh và video
    /// </summary>
    /// <remarks>
    /// Request: multipart/form-data
    /// - Item fields: serialNumber, itemTypeId, title, brand, model, year, mileage, batteryCapacity, capacity, cycles, condition, price, style, color, seat, batteryIncluded, weight, licensePlate, origin, fuel, gearbox
    /// - Listing fields: listingType (BuyNow or Auction), status, buyNowPrice, startPrice, bidIncrement, detail, address, warranty
    /// - Files: images (max 10, max 10MB each), video (max 1GB, optional)
    /// </remarks>
    [HttpPut("with-item")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status401Unauthorized)]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<ApiResponse<ListingResponseDto>>> UpdateItemWithListing(
        [FromForm] UpdateItemWithListingDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Validation failed", errors));
            }

            // Validate images
            if (dto.Images != null && dto.Images.Count > 10)
                return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Maximum 10 images allowed"));

            // Validate video
            if (dto.Video != null)
            {
                var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm" };
                var fileExtension = Path.GetExtension(dto.Video.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Invalid video format. Allowed: mp4, avi, mov, wmv, flv, webm"));

                if (dto.Video.Length > 1024 * 1024 * 1024)
                    return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Video file too large. Maximum size is 1GB"));
            }

            // Lấy userId từ JWT token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(ApiResponse<ListingResponseDto>.ErrorResult("Invalid or missing user ID in token"));
            }

            // Base URL to build absolute URLs
            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var result = await _listingService.UpdateItemWithListingAsync(userId, dto, baseUrl, webRootPath);
            
            if (result == null)
                return NotFound(ApiResponse<ListingResponseDto>.ErrorResult("Item or Listing not found"));
            
            return Ok(ApiResponse<ListingResponseDto>.SuccessResult(result, "Item and Listing updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ListingResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item with listing");
            return StatusCode(500, ApiResponse<ListingResponseDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Xóa cả Item và Listing cùng lúc
    /// </summary>
    [HttpDelete("with-item/{listingId}")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<ApiResponse>> DeleteItemWithListing(Guid listingId)
    {
        try
        {
            // Lấy userId từ JWT token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(ApiResponse.ErrorResult("Invalid or missing user ID in token"));
            }

            // Lấy listing để check ownership
            var listing = await _listingService.GetListingByListingIdAsync(listingId);
            if (listing == null)
                return NotFound(ApiResponse.ErrorResult($"Listing with ID {listingId} not found"));

            if (listing.UserId != userId)
                return Forbid();

            var result = await _listingService.DeleteItemWithListingAsync(listingId);
            
            if (!result)
                return NotFound(ApiResponse.ErrorResult($"Listing with ID {listingId} not found"));

            return Ok(ApiResponse.SuccessResult("Item and Listing deleted successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item with listing {ListingId}", listingId);
            return StatusCode(500, ApiResponse.ErrorResult("Internal server error occurred while deleting item and listing", ex.Message));
        }
    }
}