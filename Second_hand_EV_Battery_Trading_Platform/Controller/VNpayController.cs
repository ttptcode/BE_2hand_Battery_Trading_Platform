using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using System.Security.Claims;

namespace Second_hand_EV_Battery_Trading_Platform.Controller;

[Route("api/[controller]")]
[ApiController]
public class VNpayController : ControllerBase
{
    private readonly VNpayService _vnpayService;
    private readonly ILogger<VNpayController> _logger;

    public VNpayController(VNpayService vnpayService, ILogger<VNpayController> logger)
    {
        _vnpayService = vnpayService;
        _logger = logger;
    }

    /// <summary>
    /// Tạo URL thanh toán VNpay
    /// </summary>
    [HttpPost("create-payment")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<ApiResponse<object>>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        try
        {
            // Lấy userId từ JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(ApiResponse<object>.ErrorResult("Invalid token"));

            var userId = Guid.Parse(userIdClaim);

            // Validate amount
            if (request.Amount <= 0)
                return BadRequest(ApiResponse<object>.ErrorResult("Amount must be greater than 0"));

            // Tạo payment URL
            var paymentUrl = await _vnpayService.CreatePaymentUrlAsync(
                userId,
                request.Amount,
                request.ListingId,
                request.FeeId);

            var data = new
            {
                paymentUrl,
                message = "Payment URL created successfully"
            };

            return Ok(ApiResponse<object>.SuccessResult(data, "Payment URL created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating VNpay payment");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Xử lý callback từ VNpay (không cần authentication)
    /// </summary>
    [HttpGet("callback")]
    public async Task<IActionResult> VNpayCallback()
    {
        try
        {
            // Lấy tất cả query parameters
            var callbackParams = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());

            // Handle callback
            var payment = await _vnpayService.HandleCallbackAsync(callbackParams);

            if (payment == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Invalid callback data"));
            }

            // Redirect về frontend với status
            var redirectUrl = $"http://localhost:5173/payment-callback?status={payment.PaymentStatus}&paymentId={payment.PaymentId}";
            
            return Redirect(redirectUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling VNpay callback");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Xử lý background job để expire pending payments
    /// </summary>
    [HttpPost("expire-pending")]
    public async Task<IActionResult> ExpirePendingPayments()
    {
        try
        {
            await _vnpayService.ExpirePendingPaymentsAsync();
            return Ok(ApiResponse<object>.SuccessResult(null, "Expired pending payments successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error expiring pending payments");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
        }
    }
}

public class CreatePaymentRequest
{
    public decimal Amount { get; set; }
    public Guid? ListingId { get; set; }
    public Guid? FeeId { get; set; }
}

