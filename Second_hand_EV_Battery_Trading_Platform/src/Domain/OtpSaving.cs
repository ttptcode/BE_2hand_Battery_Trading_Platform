using System;

namespace Second_hand_EV_Battery_Trading_Platform.src.Domain;

public partial class OtpSaving
{
    public Guid OtpSavingId { get; set; }

    public string Phone { get; set; } = null!;

    // store salted SHA256 hash (base64)
    public string OtpHash { get; set; } = null!;

    // salt used for hashing (base64)
    public string Salt { get; set; } = null!;

    // how many wrong verification attempts so far
    public int Attempts { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }
}