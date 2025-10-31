using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public interface IFavoriteRepository
    {
        Task<Favorite> CreateAsync(Favorite favorite);
        Task<IEnumerable<Favorite>> GetByUserIdAsync(Guid userId);
        Task<bool> DeleteAsync(Guid id);
        Task<Favorite?> GetByIdAsync(Guid id);
        Task<Favorite?> GetByUserAndListingAsync(Guid userId, Guid listingId);
    }
}
