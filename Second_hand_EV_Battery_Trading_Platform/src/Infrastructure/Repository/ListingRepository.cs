using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class ListingRepository : IListingRepository
{
    private readonly OemEvWarrantyContext _context;

    public ListingRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task<Listing?> GetByIdAsync(Guid id)
    {
        return await _context.Listings.FirstOrDefaultAsync(l => l.ListingId == id);
    }

    public async Task<Listing?> GetByIdDetailedAsync(Guid id)
        => await _context.Listings
            .Include(l => l.User)
            .Include(l => l.Item)
            .Include(l => l.Fee)
            .FirstOrDefaultAsync(l => l.ListingId == id);

    public async Task<IEnumerable<Listing>> GetAllAsync()
        => await _context.Listings
            .Include(l => l.User)
            .Include(l => l.Item)
            .Include(l => l.Fee)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Listing>> GetByUserIdAsync(Guid userId)
        => await _context.Listings
            .Include(l => l.User)
            .Include(l => l.Item)
            .Include(l => l.Fee)
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Listing>> GetByListingTypeAsync(string listingType)
        => await _context.Listings
            .Include(l => l.User).Include(l => l.Item).Include(l => l.Fee)
            .Where(l => l.ListingType == listingType)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Listing>> GetByItemIdAsync(Guid itemId)
        => await _context.Listings
            .Include(l => l.User).Include(l => l.Item).Include(l => l.Fee)
            .Where(l => l.ItemId == itemId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Listing>> GetByStatusAsync(string status)
        => await _context.Listings
            .Include(l => l.User).Include(l => l.Item).Include(l => l.Fee)
            .Where(l => l.Status == status)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Listing>> SearchAsync(string? keyword, string? listingType, string? status)
    {
        var q = _context.Listings
            .Include(l => l.User)
            .Include(l => l.Item)
            .Include(l => l.Fee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            q = q.Where(l =>
                (l.Item!.Title != null && l.Item.Title.Contains(keyword)) ||
                (l.User!.FullName != null && l.User.FullName.Contains(keyword)));
        }

        if (!string.IsNullOrWhiteSpace(listingType))
            q = q.Where(l => l.ListingType == listingType);

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(l => l.Status == status);

        return await q.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    public async Task<decimal> GetCurrentPriceAsync(Guid listingId)
    {
        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.ListingId == listingId);
        if (listing == null)
            return 0M;

        // Fallbacks: Current price = StartPrice if no bids yet
        return listing.StartPrice ?? 0M;
    }

    public async Task UpdateCurrentPriceAsync(Guid listingId, decimal currentPrice)
    {
        var listing = await _context.Listings.FirstOrDefaultAsync(l => l.ListingId == listingId);
        if (listing == null)
            return;

        // No dedicated field for current price; optionally could be StartPrice updated or kept separate in future
        listing.StartPrice = currentPrice;
        _context.Listings.Update(listing);
        await _context.SaveChangesAsync();
    }

    public async Task<Listing> CreateAsync(Listing listing)
    {
        listing.ListingId = Guid.NewGuid();
        listing.CreatedAt = DateTime.UtcNow;
        listing.UpdatedAt = DateTime.UtcNow;
        _context.Listings.Add(listing);
        await _context.SaveChangesAsync();
        return listing;
    }

    public async Task<Listing> UpdateAsync(Listing listing)
    {
        _context.Listings.Update(listing);
        await _context.SaveChangesAsync();
        return listing;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var e = await _context.Listings.FindAsync(id);
        if (e == null) return false;
        _context.Listings.Remove(e);
        await _context.SaveChangesAsync();
        return true;
    }
}