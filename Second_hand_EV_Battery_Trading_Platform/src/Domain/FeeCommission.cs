using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class FeeCommission
{
    public Guid FeeId { get; set; }

    public string? FeeName { get; set; }

    public string? FeeType { get; set; }

    public decimal? Amount { get; set; }

    public int? PackageDurationDays { get; set; }

    public int? MaxListings { get; set; }

    public decimal? SavingAmount { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();

    public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();
}
