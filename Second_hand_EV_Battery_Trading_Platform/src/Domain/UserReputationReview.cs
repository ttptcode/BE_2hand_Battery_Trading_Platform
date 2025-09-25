using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class UserReputationReview
{
    public Guid ReputationReviewId { get; set; }

    public Guid? ReviewerId { get; set; }

    public Guid? RevieweeId { get; set; }

    public Guid? ItemId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Item? Item { get; set; }

    public virtual User? Reviewee { get; set; }

    public virtual User? Reviewer { get; set; }
}
