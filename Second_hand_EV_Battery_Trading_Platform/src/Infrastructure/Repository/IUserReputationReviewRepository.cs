using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public interface IUserReputationReviewRepository
    {
        Task<UserReputationReview> CreateAsync(UserReputationReview review);
        Task<UserReputationReview?> GetByIdAsync(Guid id);
        Task<IEnumerable<UserReputationReview>> GetByRevieweeIdAsync(Guid revieweeId);
        Task<IEnumerable<UserReputationReview>> GetByReviewerIdAsync(Guid reviewerId);
        Task<IEnumerable<UserReputationReview>> GetByListingIdAsync(Guid listingId);
        Task<bool> DeleteAsync(Guid id);
        Task<UserReputationReview> UpdateAsync(UserReputationReview review);

    }
}
