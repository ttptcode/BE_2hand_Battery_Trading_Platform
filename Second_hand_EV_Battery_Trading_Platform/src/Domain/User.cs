using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class User
{
    public Guid UserId { get; set; }

    public Guid? RoleId { get; set; }

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? PasswordHash { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<AuctionResult> AuctionResults { get; set; } = new List<AuctionResult>();

    public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();

    public virtual ICollection<Conversation> ConversationBuyers { get; set; } = new List<Conversation>();

    public virtual ICollection<Conversation> ConversationSellers { get; set; } = new List<Conversation>();

    public virtual ICollection<Item> Items { get; set; } = new List<Item>();

    public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();

    public virtual Role? Role { get; set; }

    public virtual ICollection<UserReputationReview> UserReputationReviewReviewees { get; set; } = new List<UserReputationReview>();

    public virtual ICollection<UserReputationReview> UserReputationReviewReviewers { get; set; } = new List<UserReputationReview>();
}
