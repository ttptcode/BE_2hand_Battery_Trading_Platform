using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class CreateFeeCommissionDto
{
    [Required, StringLength(100)]
    public string FeeName { get; set; } = default!;

    // Chỉ VIP hoặc Post (phí lẻ)
    [Required, RegularExpression("VIP|Post", ErrorMessage = "FeeType must be 'VIP' or 'Post'")]
    public string FeeType { get; set; } = default!;

    // Với VIP: Amount là giá mua gói; Với Post: Amount là phí đăng tin/lần
    [Range(0, double.MaxValue)]
    public decimal? Amount { get; set; }

    // Áp dụng cho VIP
    [Range(1, 3650)]
    public int? PackageDurationDays { get; set; }

    // Áp dụng cho VIP: quota tin trong kỳ
    [Range(0, int.MaxValue)]
    public int? MaxListings { get; set; }

    // Tuỳ chọn: thể hiện số tiền “tiết kiệm” so với mua lẻ
    [Range(0, double.MaxValue)]
    public decimal? SavingAmount { get; set; }

    public string? Description { get; set; }
}

public class UpdateFeeCommissionDto
{
    public string? FeeName { get; set; }
    public string? FeeType { get; set; } // "VIP" | "Post"
    public decimal? Amount { get; set; }
    public int? PackageDurationDays { get; set; }
    public int? MaxListings { get; set; }
    public decimal? SavingAmount { get; set; }
    public string? Description { get; set; }
}

public class FeeCommissionResponseDto
{
    public Guid FeeId { get; set; }
    public string? FeeName { get; set; }
    public string? FeeType { get; set; }
    public decimal? Amount { get; set; }
    public int? PackageDurationDays { get; set; }
    public int? MaxListings { get; set; }
    public decimal? SavingAmount { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
}

