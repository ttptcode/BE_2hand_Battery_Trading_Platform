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
}


