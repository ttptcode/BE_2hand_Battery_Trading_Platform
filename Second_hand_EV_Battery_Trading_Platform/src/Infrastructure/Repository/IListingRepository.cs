using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IListingRepository
{
    Task<Listing?> GetByIdAsync(Guid id);
    Task<decimal> GetCurrentPriceAsync(Guid listingId);
    Task UpdateCurrentPriceAsync(Guid listingId, decimal currentPrice);
}


