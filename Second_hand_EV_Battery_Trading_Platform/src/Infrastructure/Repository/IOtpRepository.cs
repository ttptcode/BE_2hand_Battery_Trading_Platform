using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IOtpRepository
{
    Task AddAsync(OtpSaving otp);
    Task<OtpSaving?> GetLatestUnexpiredAsync(string phone);
    Task<int> CountSentSinceAsync(string phone, DateTime since);
    Task IncrementAttemptsAsync(OtpSaving otp);
    Task MarkAsUsedAsync(OtpSaving otp);
}