using System;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Favorite
{
    public Guid FavoriteId { get; set; }

    public Guid? UserId { get; set; }

    public Guid? ListingId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? User { get; set; }

    public virtual Listing? Listing { get; set; }
}
