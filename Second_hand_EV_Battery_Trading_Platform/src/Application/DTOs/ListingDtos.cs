using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public enum ListingTypeDto
{ BuyNow, Auction }

public class ListingDto
{
    public Guid ListingId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? ItemId { get; set; }
    public Guid? FeeId { get; set; }
    public string? ListingType { get; set; }
    public decimal? BuyNowPrice { get; set; }
    public decimal? StartPrice { get; set; }
    public decimal? BidIncrement { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Detail { get; set; }
    public string? Address { get; set; }
    public string? Warranty { get; set; }
    public string? YouAre { get; set; }
}

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

    public DateTime? EndDate { get; set; } // bắt buộc nếu Auction

    // Thanh toán/gói
    public Guid? FeeId { get; set; } // VIP package (nếu có)

    // Thông tin bổ sung
    public string? Detail { get; set; }
    public string? Address { get; set; }
    public string? Warranty { get; set; }
    public string? YouAre { get; set; }
}

public class UpdateListingDto
{
    [Required]
    public Guid ListingId { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    // Giá – sẽ được dùng tùy theo ListingType hiện tại
    [Range(0, double.MaxValue)]
    public decimal? BuyNowPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? StartPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? BidIncrement { get; set; }

    // Thông tin bổ sung
    public string? Detail { get; set; }
    public string? Address { get; set; }
    public string? Warranty { get; set; }
    public string? YouAre { get; set; }
}

public class ListingResponseDto
{
    public Guid ListingId { get; set; }
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
    public DateTime? UpdatedAt { get; set; }

    // Thông tin mở rộng
    public string? UserName { get; set; }
    public string? ItemTitle { get; set; }
    public string? FeeName { get; set; }

    // Thông tin chi tiết item
    public ItemResponseDto? Item { get; set; }

    // Thông tin bổ sung
    public string? Detail { get; set; }
    public string? Address { get; set; }
    public string? Warranty { get; set; }
    public string? YouAre { get; set; }
}

/// <summary>
/// DTO để tạo Item và Listing cùng lúc, bao gồm cả file upload
/// </summary>
public class CreateItemWithListingDto
{
    // ===== ITEM FIELDS =====
    [StringLength(100)]
    public string? SerialNumber { get; set; } 

    [Required]
    public Guid ItemTypeId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; } 

    [StringLength(100)]
    public string? Brand { get; set; }

    [StringLength(100)]
    public string? Model { get; set; }

    [Range(1900, 2030)]
    public int? Year { get; set; }

    // Mileage now string
    //[Range(0, int.MaxValue)]
    //public int? Mileage { get; set; }
    [StringLength(100)]
    public string? Mileage { get; set; }

    [Range(0, int.MaxValue)]
    public int? BatteryCapacity { get; set; }

    //[Range(0, int.MaxValue)]
    //public int? Capacity { get; set; }
    [StringLength(100)]
    public string? Capacity { get; set; }

    [Range(0, int.MaxValue)]
    public int? Cycles { get; set; }

    [StringLength(200)]
    public string? Condition { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }

    [StringLength(100)]
    public string? Style { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    // Seat now string
    //[Range(1, 50)]
    //public int? Seat { get; set; }
    [StringLength(50)]
    public string? Seat { get; set; }

    [StringLength(100)]
    public string? BatteryIncluded { get; set; }

    // Weight now string
    //[Range(0, double.MaxValue)]
    //public decimal? Weight { get; set; }
    [StringLength(50)]
    public string? Weight { get; set; }

    [StringLength(20)]
    public string? LicensePlate { get; set; }

    [StringLength(100)]
    public string? Origin { get; set; }

    [StringLength(50)]
    public string? Fuel { get; set; }

    [StringLength(50)]
    public string? Gearbox { get; set; }

    // New fields
    [StringLength(100)]
    public string? Version { get; set; }

    [StringLength(100)]
    public string? Engine { get; set; }

    // OwnerCount now string
    //[Range(0, int.MaxValue)]
    //public int? OwnerCount { get; set; }
    [StringLength(50)]
    public string? OwnerCount { get; set; }

    // InspectionValidUntil now bool
    //public DateTime? InspectionValidUntil { get; set; }
    public bool? InspectionValidUntil { get; set; }

    // Accessories now bool
    //[StringLength(1000)]
    //public string? Accessories { get; set; }
    public bool? Accessories { get; set; }

    [StringLength(100)]
    public string? BatteryType { get; set; }

    [StringLength(50)]
    public string? Voltage { get; set; }

    [StringLength(100)]
    public string? FrameMaterial { get; set; }

    [StringLength(100)]
    public string? FrameSize { get; set; }

    [StringLength(100)]
    public string? PartType { get; set; }

    // ===== LISTING FIELDS =====
    [Required]
    public ListingTypeDto ListingType { get; set; }

    // Bán ngay
    [Range(0, double.MaxValue)]
    public decimal? BuyNowPrice { get; set; }

    // Đấu giá
    [Range(0, double.MaxValue)]
    public decimal? StartPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? BidIncrement { get; set; }

    // Thời gian
    public DateTime? EndDate { get; set; }

    // Thanh toán/gói
    public Guid? FeeId { get; set; }

    // Thông tin bổ sung
    public string? Detail { get; set; }
    public string? Address { get; set; }
    public string? Warranty { get; set; }

    // --- YouAre for listing ---
    public string? YouAre { get; set; }

    // --- 👇 THÊM CÁC TRƯỜNG FILE UPLOAD VÀO ĐÂY 👇 ---


    public List<IFormFile>? Images { get; set; }

    public IFormFile? Video { get; set; }
}

/// <summary>
/// DTO để update Item và Listing cùng lúc, bao gồm cả file upload
/// </summary>
public class UpdateItemWithListingDto
{
    // ===== ITEM FIELDS =====
    [Required]
    public Guid ItemId { get; set; }

    [StringLength(100)]
    public string? SerialNumber { get; set; }

    public Guid? ItemTypeId { get; set; }

    [StringLength(255)]
    public string? Title { get; set; }

    [StringLength(100)]
    public string? Brand { get; set; }

    [StringLength(100)]
    public string? Model { get; set; }

    [Range(1900, 2030)]
    public int? Year { get; set; }

    //[Range(0, int.MaxValue)]
    //public int? Mileage { get; set; }
    [StringLength(100)]
    public string? Mileage { get; set; }

    [Range(0, int.MaxValue)]
    public int? BatteryCapacity { get; set; }

    //[Range(0, int.MaxValue)]
    //public int? Capacity { get; set; }
    [StringLength(100)]
    public string? Capacity { get; set; }

    [Range(0, int.MaxValue)]
    public int? Cycles { get; set; }

    [StringLength(200)]
    public string? Condition { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }

    [StringLength(100)]
    public string? Style { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    //[Range(1, 50)]
    //public int? Seat { get; set; }
    [StringLength(50)]
    public string? Seat { get; set; }

    [StringLength(100)]
    public string? BatteryIncluded { get; set; }

    //[Range(0, double.MaxValue)]
    //public decimal? Weight { get; set; }
    [StringLength(50)]
    public string? Weight { get; set; }

    [StringLength(20)]
    public string? LicensePlate { get; set; }

    [StringLength(100)]
    public string? Origin { get; set; }

    [StringLength(50)]
    public string? Fuel { get; set; }

    [StringLength(50)]
    public string? Gearbox { get; set; }

    // New fields
    [StringLength(100)]
    public string? Version { get; set; }

    [StringLength(100)]
    public string? Engine { get; set; }

    //[Range(0, int.MaxValue)]
    //public int? OwnerCount { get; set; }
    [StringLength(50)]
    public string? OwnerCount { get; set; }

    //public DateTime? InspectionValidUntil { get; set; }
    public bool? InspectionValidUntil { get; set; }

    //public string? Accessories { get; set; }
    public bool? Accessories { get; set; }

    [StringLength(1000)]
    public string? BatteryType { get; set; }

    [StringLength(50)]
    public string? Voltage { get; set; }

    [StringLength(100)]
    public string? FrameMaterial { get; set; }

    [StringLength(100)]
    public string? FrameSize { get; set; }

    [StringLength(100)]
    public string? PartType { get; set; }

    // ===== LISTING FIELDS =====
    [Required]
    public Guid ListingId { get; set; }

    public ListingTypeDto? ListingType { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    // Giá – sẽ được dùng tùy theo ListingType hiện tại
    [Range(0, double.MaxValue)]
    public decimal? BuyNowPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? StartPrice { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? BidIncrement { get; set; }

    // Thông tin bổ sung
    public string? Detail { get; set; }
    public string? Address { get; set; }
    public string? Warranty { get; set; }

    // --- YouAre for listing ---
    public string? YouAre { get; set; }

    // Files
    public List<IFormFile>? Images { get; set; }

    public IEnumerable<string>? existingImageUrls { get; set; }
    public IFormFile? Video { get; set; }
}