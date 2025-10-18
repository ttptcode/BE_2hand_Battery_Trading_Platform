using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class BidRepository : IBidRepository
{
    private readonly OemEvWarrantyContext _context;

    public BidRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task<Bid?> GetHighestProxyForListingAsync(Guid listingId)
    {
        return await _context.Bids
            .Where(b => b.ListingId == listingId)
            .OrderByDescending(b => b.MaxBidAmount)
            .FirstOrDefaultAsync();
    }

    public async Task<Bid?> GetSecondHighestProxyForListingAsync(Guid listingId)
    {
        return await _context.Bids
            .Where(b => b.ListingId == listingId)
            .OrderByDescending(b => b.MaxBidAmount)
            .Skip(1)
            .FirstOrDefaultAsync();
    }

    public async Task<IReadOnlyList<Bid>> GetAllProxiesForListingAsync(Guid listingId)
    {
        return await _context.Bids
            .Where(b => b.ListingId == listingId)
            .OrderByDescending(b => b.MaxBidAmount)
            .ToListAsync();
    }

    public async Task<Bid> AddAsync(Bid bid)
    {
        _context.Bids.Add(bid);
        await _context.SaveChangesAsync();
        return bid;
    }
}


