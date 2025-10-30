using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public interface IUserReputationReviewService
    {
        Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto);
        Task<IEnumerable<ReviewResponseDto>> GetReviewsByRevieweeAsync(Guid revieweeId);
        Task<IEnumerable<ReviewResponseDto>> GetReviewsByReviewerAsync(Guid reviewerId);
        Task<IEnumerable<ReviewResponseDto>> GetReviewsByListingAsync(Guid listingId);
        Task<bool> DeleteReviewAsync(Guid reviewId, Guid requestingUserId); // requestingUserId used to check ownership
        Task<ReviewResponseDto?> GetByIdAsync(Guid id);
        Task<ReviewResponseDto?> UpdateReviewAsync(Guid id, UpdateReviewDto dto);
    }
}
