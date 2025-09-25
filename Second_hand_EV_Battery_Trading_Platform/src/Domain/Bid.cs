using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Bid
{
    public Guid BidId { get; set; }

    public Guid? ListingId { get; set; }

    public Guid? BidderId { get; set; }

    public decimal? MaxBidAmount { get; set; }

    public bool? ProxyActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Bidder { get; set; }

    public virtual Listing? Listing { get; set; }
}
