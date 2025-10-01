using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly IBiddingService _biddingService;

    public ListingsController(IBiddingService biddingService)
    {
        _biddingService = biddingService;
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
}


