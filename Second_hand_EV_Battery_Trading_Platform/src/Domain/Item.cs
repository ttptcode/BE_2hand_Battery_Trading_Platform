using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Item
{
    public Guid ItemId { get; set; }

    public Guid? UserId { get; set; }

    public string? SerialNumber { get; set; }

    public Guid? ItemTypeId { get; set; }

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

    // Images moved to ItemImage entity (one-to-many)

    public string? Status { get; set; }

    public string? VideoUrl { get; set; }

    public string? Style { get; set; }

    public string? Color { get; set; }

    public int? Seat { get; set; }

    public string? BatteryIncluded { get; set; }

    public decimal? Weight { get; set; }

    public string? LicensePlate { get; set; }

    public string? Origin { get; set; }

    public string? Fuel { get; set; }

    public string? Gearbox { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }


    public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();

    public virtual User? User { get; set; }

    public virtual ItemType? ItemType { get; set; }

    public virtual ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();

    public virtual ICollection<UserReputationReview> UserReputationReviews { get; set; } = new List<UserReputationReview>();
}
