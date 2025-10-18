using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
[Produces(MediaTypeNames.Application.Json)]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>Top up ví (nạp tiền vào Balance).</summary>
    [HttpPost("topup")]
    [ProducesResponseType(typeof(ApiResponse<PaymentResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<PaymentResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> TopUp([FromBody] TopUpRequestDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<PaymentResponseDto>.ErrorResult("Validation failed", errors));
            }

            var result = await _paymentService.TopUpAsync(dto);
            return StatusCode(201, ApiResponse<PaymentResponseDto>.SuccessResult(result, "Topup success"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<PaymentResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TopUp error");
            return StatusCode(500, ApiResponse<PaymentResponseDto>.ErrorResult("Internal error", ex.Message));
        }
    }

    /// <summary>Mua gói VIP (FeeType = VIP). Trả bằng Wallet hoặc Gateway.</summary>
    [HttpPost("purchase-vip")]
    [ProducesResponseType(typeof(ApiResponse<PaymentResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<PaymentResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> PurchaseVip([FromBody] PurchaseVipRequestDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<PaymentResponseDto>.ErrorResult("Validation failed", errors));
            }

            var result = await _paymentService.PurchaseVipAsync(dto);
            return StatusCode(201, ApiResponse<PaymentResponseDto>.SuccessResult(result, "VIP purchased"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<PaymentResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Purchase VIP error");
            return StatusCode(500, ApiResponse<PaymentResponseDto>.ErrorResult("Internal error", ex.Message));
        }
    }
}
