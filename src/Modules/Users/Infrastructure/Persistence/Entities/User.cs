using System;
using System.Collections.Generic;

namespace Modules.Users.Infrastructure.Persistence.Entities
{

    public class User
    {
        public Guid UserId { get; set; }
        public Guid? RoleId { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PasswordHash { get; set; }
        public string? Phone { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Role? Role { get; set; }
        public virtual ICollection<UserReputationReview> UserReputationReviewReviewees { get; set; } = new List<UserReputationReview>();
        public virtual ICollection<UserReputationReview> UserReputationReviewReviewers { get; set; } = new List<UserReputationReview>();
    }
}