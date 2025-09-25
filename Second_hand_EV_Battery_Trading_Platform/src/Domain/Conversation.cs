using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Conversation
{
    public Guid ConversationId { get; set; }

    public Guid? ItemId { get; set; }

    public Guid? SellerId { get; set; }

    public Guid? BuyerId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Status { get; set; }

    public virtual User? Buyer { get; set; }

    public virtual Item? Item { get; set; }

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual User? Seller { get; set; }
}
