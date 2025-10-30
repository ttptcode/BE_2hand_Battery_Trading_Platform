using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public class UserReputationReviewRepository: IUserReputationReviewRepository
    {
        private readonly OemEvWarrantyContext _context;

        public UserReputationReviewRepository(OemEvWarrantyContext context)
        {
            _context = context;
        }

        public async Task<UserReputationReview> CreateAsync(UserReputationReview review)
        {
            if (review.ReputationReviewId == Guid.Empty)
                review.ReputationReviewId = Guid.NewGuid();

            review.CreatedAt = DateTime.UtcNow;
            _context.UserReputationReviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<UserReputationReview?> GetByIdAsync(Guid id)
            => await _context.UserReputationReviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Listing)
                .FirstOrDefaultAsync(r => r.ReputationReviewId == id);

        public async Task<IEnumerable<UserReputationReview>> GetByRevieweeIdAsync(Guid revieweeId)
            => await _context.UserReputationReviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Listing)
                .Where(r => r.RevieweeId == revieweeId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<UserReputationReview>> GetByReviewerIdAsync(Guid reviewerId)
            => await _context.UserReputationReviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Listing)
                .Where(r => r.ReviewerId == reviewerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<UserReputationReview>> GetByListingIdAsync(Guid listingId)
            => await _context.UserReputationReviews
                .Include(r => r.Reviewer)
                .Include(r => r.Reviewee)
                .Include(r => r.Listing)
                .Where(r => r.ListingId == listingId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

        public async Task<bool> DeleteAsync(Guid id)
        {
            var e = await _context.UserReputationReviews.FindAsync(id);
            if (e == null) return false;
            _context.UserReputationReviews.Remove(e);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
