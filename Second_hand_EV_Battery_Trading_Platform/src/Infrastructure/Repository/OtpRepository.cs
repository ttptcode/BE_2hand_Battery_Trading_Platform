using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class OtpRepository : IOtpRepository
{
    private readonly OemEvWarrantyContext _context;

    public OtpRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task AddAsync(OtpSaving otp)
    {
        _context.OtpSavings.Add(otp);
        await _context.SaveChangesAsync();
    }

    public async Task<OtpSaving?> GetLatestUnexpiredAsync(string phone)
    {
        var now = DateTime.UtcNow;
        return await _context.OtpSavings
            .Where(o => o.Phone == phone && !o.IsUsed && o.ExpiresAt >= now)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<int> CountSentSinceAsync(string phone, DateTime since)
    {
        return await _context.OtpSavings
            .Where(o => o.Phone == phone && o.CreatedAt >= since)
            .CountAsync();
    }

    public async Task IncrementAttemptsAsync(OtpSaving otp)
    {
        otp.Attempts += 1;
        _context.OtpSavings.Update(otp);
        await _context.SaveChangesAsync();
    }

    public async Task MarkAsUsedAsync(OtpSaving otp)
    {
        otp.IsUsed = true;
        _context.OtpSavings.Update(otp);
        await _context.SaveChangesAsync();
    }
}