using System;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class ItemImage
{
    public Guid ItemImageId { get; set; }

    public Guid ItemId { get; set; }

    public string Url { get; set; } = string.Empty;

    public DateTime? CreatedAt { get; set; }

    public virtual Item? Item { get; set; }
}


