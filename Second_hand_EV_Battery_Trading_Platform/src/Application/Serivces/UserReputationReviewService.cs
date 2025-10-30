using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public class UserReputationReviewService : IUserReputationReviewService
    {
        private readonly IUserReputationReviewRepository _repo;
        private readonly IUserRepository _userRepo;
        private readonly IListingRepository _listingRepo;

        public UserReputationReviewService(
            IUserReputationReviewRepository repo,
            IUserRepository userRepo,
            IListingRepository listingRepo)
        {
            _repo = repo;
            _userRepo = userRepo;
            _listingRepo = listingRepo;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto)
        {
            // Basic validations
            if (dto.ReviewerId == dto.RevieweeId)
                throw new InvalidOperationException("Reviewer and reviewee cannot be the same user.");

            var reviewer = await _userRepo.GetByIdAsync(dto.ReviewerId)
                ?? throw new InvalidOperationException("Reviewer not found");

            var reviewee = await _userRepo.GetByIdAsync(dto.RevieweeId)
                ?? throw new InvalidOperationException("Reviewee not found");

            if (dto.ListingId.HasValue)
            {
                var listing = await _listingRepo.GetByIdAsync(dto.ListingId.Value);
                if (listing == null)
                    throw new InvalidOperationException("Listing not found");
            }

            // Create entity
            var entity = new UserReputationReview
            {
                ReputationReviewId = Guid.NewGuid(),
                ReviewerId = dto.ReviewerId,
                RevieweeId = dto.RevieweeId,
                ListingId = dto.ListingId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.CreateAsync(entity);

            return MapToDto(created);
        }
        public async Task<ReviewResponseDto?> UpdateReviewAsync(Guid id, UpdateReviewDto dto)
        {
            var review = await _repo.GetByIdAsync(id); // repo.GetByIdAsync đã Include Reviewer + Reviewee
            if (review == null) return null;

            if (dto.Rating.HasValue)
                review.Rating = dto.Rating;

            if (!string.IsNullOrEmpty(dto.Comment))
                review.Comment = dto.Comment;

            if (dto.ListingId.HasValue)
                review.ListingId = dto.ListingId;

            var updated = await _repo.UpdateAsync(review); // UpdateAsync cũng Include Reviewer + Reviewee

            return new ReviewResponseDto
            {
                ReputationReviewId = updated.ReputationReviewId,
                ReviewerId = updated.ReviewerId ?? Guid.Empty,
                ReviewerName = updated.Reviewer?.FullName,   // <-- thêm vào
                RevieweeId = updated.RevieweeId ?? Guid.Empty,
                RevieweeName = updated.Reviewee?.FullName,   // <-- thêm vào
                ListingId = updated.ListingId,
                Rating = updated.Rating ?? 0,
                Comment = updated.Comment,
                CreatedAt = updated.CreatedAt
            };
        }







        public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByRevieweeAsync(Guid revieweeId)
        {
            var list = await _repo.GetByRevieweeIdAsync(revieweeId);
            return list.Select(MapToDto);
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByReviewerAsync(Guid reviewerId)
        {
            var list = await _repo.GetByReviewerIdAsync(reviewerId);
            return list.Select(MapToDto);
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetReviewsByListingAsync(Guid listingId)
        {
            var list = await _repo.GetByListingIdAsync(listingId);
            return list.Select(MapToDto);
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid requestingUserId)
        {
            var review = await _repo.GetByIdAsync(reviewId)
                ?? throw new InvalidOperationException("Review not found");

            // Only the reviewer (author) can delete their review (extendable to admin)
            if (review.ReviewerId != requestingUserId)
                throw new UnauthorizedAccessException("You are not allowed to delete this review.");

            return await _repo.DeleteAsync(reviewId);
        }

        public async Task<ReviewResponseDto?> GetByIdAsync(Guid id)
        {
            var r = await _repo.GetByIdAsync(id);
            return r == null ? null : MapToDto(r);
        }

        private ReviewResponseDto MapToDto(UserReputationReview r)
        {
            return new ReviewResponseDto
            {
                ReputationReviewId = r.ReputationReviewId,
                ReviewerId = r.ReviewerId ?? Guid.Empty,
                ReviewerName = r.Reviewer?.FullName,
                RevieweeId = r.RevieweeId ?? Guid.Empty,
                RevieweeName = r.Reviewee?.FullName,
                ListingId = r.ListingId,
                Rating = r.Rating ?? 0,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            };
        }
    }
}
