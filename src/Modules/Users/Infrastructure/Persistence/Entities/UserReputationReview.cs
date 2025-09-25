using System;

namespace Modules.Users.Infrastructure.Persistence.Entities
{
    public class UserReputationReview
    {
        public Guid ReputationReviewId { get; set; }
        public Guid? ItemId { get; set; }
        public Guid? ReviewerId { get; set; }
        public Guid? RevieweeId { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }

        public virtual User? Reviewer { get; set; }
        public virtual User? Reviewee { get; set; }
    }
}