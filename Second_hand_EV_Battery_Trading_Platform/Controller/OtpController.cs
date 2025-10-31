using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Microsoft.Extensions.Logging;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly ILogger<OtpController> _logger;

    public OtpController(IOtpService otpService, ILogger<OtpController> logger)
    {
        _otpService = otpService;
        _logger = logger;
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send([FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.ErrorResult("Invalid request", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

        try
        {
            var result = await _otpService.SendOtpAsync(request.Phone);
            return Ok(ApiResponse<SendOtpResponse>.SuccessResult(result, "OTP sent"));
        }
        catch (InvalidOperationException ex) when (ex.Message?.Contains("Too many") == true)
        {
            _logger.LogWarning(ex, "Rate limit while sending OTP to {Phone}", request.Phone);
            return StatusCode(StatusCodes.Status429TooManyRequests, ApiResponse.ErrorResult(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "SendOtp failed for {Phone}", request.Phone);
            return BadRequest(ApiResponse.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error sending OTP to {Phone}", request.Phone);
            return StatusCode(500, ApiResponse.ErrorResult("Failed to send OTP", ex.Message));
        }
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] VerifyOtpRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponse.ErrorResult("Invalid request", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

        try
        {
            var (success, error) = await _otpService.VerifyOtpAsync(request.Phone, request.Otp);
            if (!success)
                return BadRequest(ApiResponse.ErrorResult(error ?? "OTP invalid or expired"));

            return Ok(ApiResponse.SuccessResult("Phone verified"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error verifying OTP for {Phone}", request.Phone);
            return StatusCode(500, ApiResponse.ErrorResult("Failed to verify OTP", ex.Message));
        }
    }
}