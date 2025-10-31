using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IOtpService
{
    Task<SendOtpResponse> SendOtpAsync(string phone);
    Task<(bool Success, string? Error)> VerifyOtpAsync(string phone, string otp);
}