using System;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class PurchasePackageRequest
{
    public Guid FeeId { get; set; }
    public int Month { get; set; } = 1; // Mặc định 1 tháng
}

public class UserPackageResponse
{
    public Guid UserId { get; set; }
    public Guid FeeId { get; set; }
    public int RemainingListings { get; set; }
    public DateTime ActivatedAt { get; set; }
    public DateTime ExpiredAt { get; set; }
    public string? Status { get; set; }
    public int Month { get; set; }
    public decimal TotalAmount { get; set; }
    public FeeCommissionResponseDto FeeCommission { get; set; } = new();
}

public class UserPackageDto
{
    public Guid UserId { get; set; }
    public Guid FeeId { get; set; }
    public int RemainingListings { get; set; }
    public DateTime ActivatedAt { get; set; }
    public DateTime ExpiredAt { get; set; }
    public string? Status { get; set; }
}
