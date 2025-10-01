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

    public ListingsController(IBiddingService biddingService,IListingService listingService, ILogger<ListingsController> logger)
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
    /// Đăng tin (Bán ngay hoặc Đấu giá) + xử lý thanh toán (VIP/Post).
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
            // Không dùng CreatedAtAction (vì bỏ GET), trả 201 trực tiếp:
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
}


