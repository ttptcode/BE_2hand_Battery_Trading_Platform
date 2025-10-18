using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using System.Net.Mime;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly IBiddingService _biddingService;
    private readonly IListingService _listingService;
    private readonly ILogger<ListingsController> _logger;

    public ListingsController(IBiddingService biddingService, IListingService listingService, ILogger<ListingsController> logger)
    {
        _biddingService = biddingService;
        _listingService = listingService;
        _logger = logger;
    }

    [HttpPost("proxy-bid")]
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
    /// ??ng tin (Bán ngay ho?c ??u giá) + x? lý thanh toán (VIP/Post).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ListingResponseDto>), StatusCodes.Status201Created)]
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

    [HttpGet("by-status/{status}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingResponseDto>>>> GetByStatus(string status)
    {
        try
        {
            var listings = await _listingService.GetListingsByStatusAsync(status);
            return Ok(ApiResponse<IEnumerable<ListingResponseDto>>.SuccessResult(listings, $"Listings with status '{status}' retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting listings by status {Status}", status);
            return StatusCode(500, ApiResponse<IEnumerable<ListingResponseDto>>.ErrorResult("Internal server error occurred while retrieving listings by status", ex.Message));
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingResponseDto>>>> Search([FromQuery] string? keyword, [FromQuery] string? listingType, [FromQuery] string? status)
    {
        try
        {
            var results = await _listingService.SearchListingsAsync(keyword, listingType, status);
            return Ok(ApiResponse<IEnumerable<ListingResponseDto>>.SuccessResult(results, "Search completed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching listings");
            return StatusCode(500, ApiResponse<IEnumerable<ListingResponseDto>>.ErrorResult("Internal server error occurred while searching listings", ex.Message));
        }
    }

    [HttpPut("{listingId}")]
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

    [HttpDelete("{listingId}")]
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
}