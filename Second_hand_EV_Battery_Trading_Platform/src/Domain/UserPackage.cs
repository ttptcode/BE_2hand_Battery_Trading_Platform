using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class UserPackage
{
    public Guid UserId { get; set; }

    public Guid FeeId { get; set; }

    public int RemainingListings { get; set; }

    public DateTime ActivatedAt { get; set; }

    public DateTime ExpiredAt { get; set; }

    public string? Status { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual FeeCommission FeeCommission { get; set; } = null!;
}
