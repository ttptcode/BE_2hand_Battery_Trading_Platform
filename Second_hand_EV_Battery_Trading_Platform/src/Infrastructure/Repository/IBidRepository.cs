using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IBidRepository
{
    Task<Bid?> GetHighestProxyForListingAsync(Guid listingId);
    Task<Bid?> GetSecondHighestProxyForListingAsync(Guid listingId);
    Task<IReadOnlyList<Bid>> GetAllProxiesForListingAsync(Guid listingId);
    Task<Bid> AddAsync(Bid bid);
}


