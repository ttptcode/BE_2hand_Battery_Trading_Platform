using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Item
{
    public Guid ItemId { get; set; }

    public Guid? UserId { get; set; }

    public string? SerialNumber { get; set; }

    public string? ItemType { get; set; }

    public string? Title { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public int? Year { get; set; }

    public int? Mileage { get; set; }

    public int? BatteryCapacity { get; set; }

    public int? Capacity { get; set; }

    public int? Cycles { get; set; }

    public string? Condition { get; set; }

    public decimal? Price { get; set; }

    public string? Images { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();

    public virtual User? User { get; set; }

    public virtual ICollection<UserReputationReview> UserReputationReviews { get; set; } = new List<UserReputationReview>();
}
