using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IListingRepository
{
    Task<Listing?> GetByIdAsync(Guid id);

    Task<decimal> GetCurrentPriceAsync(Guid listingId);

    Task UpdateCurrentPriceAsync(Guid listingId, decimal currentPrice);

    Task<Listing> CreateAsync(Listing listing);

    Task<Listing?> GetByIdDetailedAsync(Guid id);

    Task<IEnumerable<Listing>> GetAllAsync();

    Task<IEnumerable<Listing>> GetByUserIdAsync(Guid userId);

    Task<IEnumerable<Listing>> GetByListingTypeAsync(string listingType);

    Task<IEnumerable<Listing>> GetByItemIdAsync(Guid itemId);

    Task<IEnumerable<Listing>> GetByStatusAsync(string status);

    Task<IEnumerable<Listing>> SearchAsync(string? keyword, string? listingType, string? status);

    Task<Listing> UpdateAsync(Listing listing);

    Task<bool> DeleteAsync(Guid id);
}