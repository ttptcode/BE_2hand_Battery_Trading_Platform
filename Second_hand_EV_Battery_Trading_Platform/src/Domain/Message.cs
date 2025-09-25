using System;
using System.Collections.Generic;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class Message
{
    public Guid MessageId { get; set; }

    public Guid? ConversationId { get; set; }

    public Guid? SenderId { get; set; }

    public string? Content { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsRead { get; set; }

    public virtual Conversation? Conversation { get; set; }

    public virtual User? Sender { get; set; }
}
