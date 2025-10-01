using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Listing
{
    public Guid ListingId { get; set; }

    public Guid? ItemId { get; set; }

    public Guid? UserId { get; set; }

    public Guid? FeeId { get; set; }

    public string? ListingType { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public decimal? StartPrice { get; set; }

    public decimal? BuyNowPrice { get; set; }

    public decimal? BidIncrement { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<AuctionResult> AuctionResults { get; set; } = new List<AuctionResult>();

    public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();

    public virtual FeeCommission? Fee { get; set; }

    public virtual Item? Item { get; set; }

    public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();

    public virtual User? User { get; set; }
}
