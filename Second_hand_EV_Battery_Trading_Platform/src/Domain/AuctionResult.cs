using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class AuctionResult
{
    public Guid AuctionResultId { get; set; }

    public Guid? ListingId { get; set; }

    public Guid? WinnerId { get; set; }

    public decimal? WinningBid { get; set; }

    public decimal? WinnerMaxBid { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? Status { get; set; }

    public virtual Listing? Listing { get; set; }

    public virtual User? Winner { get; set; }
}
