using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public enum ListingTypeDto { BuyNow, Auction }

public class CreateListingDto
{
    [Required] public Guid UserId { get; set; }
    [Required] public Guid ItemId { get; set; }
    [Required] public ListingTypeDto ListingType { get; set; }

    // Bán ngay
    [Range(0, double.MaxValue)]
    public decimal? BuyNowPrice { get; set; }

    // Đấu giá
    [Range(0, double.MaxValue)]
    public decimal? StartPrice { get; set; }
    [Range(0, double.MaxValue)]
    public decimal? BidIncrement { get; set; }

    // Thời gian
    public DateTime? StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; } // bắt buộc nếu Auction

    // Thanh toán/gói
    public Guid? FeeId { get; set; } // VIP package (nếu có)
    public string? PaymentMethod { get; set; } // "Wallet" | "Gateway"
}

public class ListingResponseDto
{
    public Guid ListingId { get; set; }
    public Guid ItemId { get; set; }
    public Guid UserId { get; set; }
    public string ListingType { get; set; } = "";
    public decimal? BuyNowPrice { get; set; }
    public decimal? StartPrice { get; set; }
    public decimal? BidIncrement { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "";
    public Guid? FeeId { get; set; }
    public DateTime? CreatedAt { get; set; }
}
