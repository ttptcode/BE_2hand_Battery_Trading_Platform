using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class PaymentTransaction
{
    public Guid PaymentId { get; set; }

    public Guid? UserId { get; set; }

    public Guid? FeeId { get; set; }

    public Guid? ListingId { get; set; }

    public decimal? Amount { get; set; }

    public string? PaymentMethod { get; set; }

    public string? PaymentStatus { get; set; }

    public string? TransactionRef { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual FeeCommission? Fee { get; set; }

    public virtual Listing? Listing { get; set; }

    public virtual User? User { get; set; }
}
