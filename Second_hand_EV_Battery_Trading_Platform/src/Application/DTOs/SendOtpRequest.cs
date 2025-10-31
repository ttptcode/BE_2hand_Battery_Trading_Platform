using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class SendOtpRequest
{
    [Required]
    [Phone]
    public string Phone { get; set; } = null!;
}

public class VerifyOtpRequest
{
    [Required]
    [Phone]
    public string Phone { get; set; } = null!;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Otp { get; set; } = null!;
}

public class SendOtpResponse
{
    public DateTime ExpiresAt { get; set; }
}