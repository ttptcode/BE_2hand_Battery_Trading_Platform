using System;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class PurchasePackageRequest
{
    public Guid UserId { get; set; }
    public Guid FeeId { get; set; }
}

public class UserPackageResponse
{
    public Guid UserId { get; set; }
    public Guid FeeId { get; set; }
    public int RemainingListings { get; set; }
    public DateTime ActivatedAt { get; set; }
    public DateTime ExpiredAt { get; set; }
    public string? Status { get; set; }
    public string? FeeName { get; set; }
    public string? FeeType { get; set; }
    public decimal? Amount { get; set; }
    public int? PackageDurationDays { get; set; }
    public int? MaxListings { get; set; }
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
