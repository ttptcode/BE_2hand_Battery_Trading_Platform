using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IUserPackageRepository
{
    Task<UserPackage?> GetUserPackageAsync(Guid userId, Guid feeId);
    Task<List<UserPackage>> GetUserPackagesAsync(Guid userId);
    Task<List<UserPackage>> GetActiveUserPackagesAsync(Guid userId);
    Task<UserPackage> CreateUserPackageAsync(UserPackage userPackage);
    Task<UserPackage> UpdateUserPackageAsync(UserPackage userPackage);
    Task<bool> DeleteUserPackageAsync(Guid userId, Guid feeId);
    Task<bool> HasActivePackageAsync(Guid userId, Guid feeId);
    Task<int> GetRemainingListingsAsync(Guid userId, Guid feeId);
    Task<bool> ConsumeListingAsync(Guid userId, Guid feeId);
}

public class UserPackageRepository : IUserPackageRepository
{
    private readonly OemEvWarrantyContext _context;

    public UserPackageRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task<UserPackage?> GetUserPackageAsync(Guid userId, Guid feeId)
    {
        return await _context.UserPackages
            .Include(up => up.FeeCommission)
            .FirstOrDefaultAsync(up => up.UserId == userId && up.FeeId == feeId);
    }

    public async Task<List<UserPackage>> GetUserPackagesAsync(Guid userId)
    {
        return await _context.UserPackages
            .Include(up => up.FeeCommission)
            .Where(up => up.UserId == userId)
            .OrderByDescending(up => up.ActivatedAt)
            .ToListAsync();
    }

    public async Task<List<UserPackage>> GetActiveUserPackagesAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        return await _context.UserPackages
            .Include(up => up.FeeCommission)
            .Where(up => up.UserId == userId && 
                        up.Status == "Active" && 
                        up.ActivatedAt <= now && 
                        up.ExpiredAt > now)
            .OrderByDescending(up => up.ActivatedAt)
            .ToListAsync();
    }

    public async Task<UserPackage> CreateUserPackageAsync(UserPackage userPackage)
    {
        _context.UserPackages.Add(userPackage);
        await _context.SaveChangesAsync();
        return userPackage;
    }

    public async Task<UserPackage> UpdateUserPackageAsync(UserPackage userPackage)
    {
        _context.UserPackages.Update(userPackage);
        await _context.SaveChangesAsync();
        return userPackage;
    }

    public async Task<bool> DeleteUserPackageAsync(Guid userId, Guid feeId)
    {
        var userPackage = await _context.UserPackages
            .FirstOrDefaultAsync(up => up.UserId == userId && up.FeeId == feeId);
        
        if (userPackage == null)
            return false;

        _context.UserPackages.Remove(userPackage);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasActivePackageAsync(Guid userId, Guid feeId)
    {
        var now = DateTime.UtcNow;
        return await _context.UserPackages
            .AnyAsync(up => up.UserId == userId && 
                          up.FeeId == feeId && 
                          up.Status == "Active" && 
                          up.ActivatedAt <= now && 
                          up.ExpiredAt > now);
    }

    public async Task<int> GetRemainingListingsAsync(Guid userId, Guid feeId)
    {
        var userPackage = await _context.UserPackages
            .FirstOrDefaultAsync(up => up.UserId == userId && 
                                      up.FeeId == feeId && 
                                      up.Status == "Active");
        
        return userPackage?.RemainingListings ?? 0;
    }

    public async Task<bool> ConsumeListingAsync(Guid userId, Guid feeId)
    {
        var userPackage = await _context.UserPackages
            .FirstOrDefaultAsync(up => up.UserId == userId && 
                                      up.FeeId == feeId && 
                                      up.Status == "Active" && 
                                      up.RemainingListings > 0);
        
        if (userPackage == null)
            return false;

        // Decrement remaining listings (allow reaching 0)
        userPackage.RemainingListings--;

        await _context.SaveChangesAsync();
        return true;
    }
}
