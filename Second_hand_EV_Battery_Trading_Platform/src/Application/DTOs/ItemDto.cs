using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class ItemDto
{
    public Guid ItemId { get; set; }
    public Guid? UserId { get; set; }
    public string? SerialNumber { get; set; }
    public Guid? ItemTypeId { get; set; }
    public string? ItemTypeName { get; set; }
    public string? Title { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    // Mileage now string
    public string? Mileage { get; set; }
    public int? BatteryCapacity { get; set; }
    public string? Capacity { get; set; }
    public int? Cycles { get; set; }
    public string? Condition { get; set; }
    public decimal? Price { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? VideoUrl { get; set; }
    public string? Style { get; set; }
    public string? Color { get; set; }
    // Seat now string
    public string? Seat { get; set; }
    public string? BatteryIncluded { get; set; }
    // Weight now string
    public string? Weight { get; set; }
    public string? LicensePlate { get; set; }
    public string? Origin { get; set; }
    public string? Fuel { get; set; }
    public string? Gearbox { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // New fields
    public string? Version { get; set; }
    public string? Engine { get; set; }
    // OwnerCount now string
    public string? OwnerCount { get; set; }
    // InspectionValidUntil now bool
    public bool? InspectionValidUntil { get; set; }
    // Accessories now bool
    public bool? Accessories { get; set; }
    public string? BatteryType { get; set; }
    public string? Voltage { get; set; }
    public string? FrameMaterial { get; set; }
    public string? FrameSize { get; set; }
    public string? PartType { get; set; }
}

public class CreateItemDto
{
    [Required]
    public Guid UserId { get; set; }
    
    [StringLength(100)]
    public string? SerialNumber { get; set; } = string.Empty;
    
   [Required]
    public Guid ItemTypeId { get; set; }
    
    [StringLength(255)]
    public string? Title { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Brand { get; set; }
    
    [StringLength(100)]
    public string? Model { get; set; }
    
    [Range(1900, 2030)]
    public int? Year { get; set; }
    
    // Mileage as string
    [StringLength(100)]
    public string? Mileage { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? BatteryCapacity { get; set; }
    
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
    
    // Seat as string
    [StringLength(50)]
    public string? Seat { get; set; }
    
    [StringLength(100)]
    public string? BatteryIncluded { get; set; }
    
    // Weight as string
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

    // OwnerCount as string
    [StringLength(50)]
    public string? OwnerCount { get; set; }

    // InspectionValidUntil as bool
    public bool? InspectionValidUntil { get; set; }

    // Accessories as bool
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
}

public class UpdateItemDto
{
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
    
    // Mileage as string
    [StringLength(100)]
    public string? Mileage { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? BatteryCapacity { get; set; }
    
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
    
    // Seat as string
    [StringLength(50)]
    public string? Seat { get; set; }
    
    [StringLength(100)]
    public string? BatteryIncluded { get; set; }
    
    // Weight as string
    [StringLength(50)]
    public string? Weight { get; set; }
    
    [StringLength(50)]
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

    // OwnerCount as string
    [StringLength(50)]
    public string? OwnerCount { get; set; }

    // InspectionValidUntil as bool
    public bool? InspectionValidUntil { get; set; }

    // Accessories as bool
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

}

public class ItemResponseDto
{
    public Guid ItemId { get; set; }
    public Guid? UserId { get; set; }
    public string? SerialNumber { get; set; }
    public Guid? ItemTypeId { get; set; }
    public string? ItemTypeName { get; set; }
    public string? Title { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    // Mileage as string
    public string? Mileage { get; set; }
    public int? BatteryCapacity { get; set; }
    public string? Capacity { get; set; }
    public int? Cycles { get; set; }
    public string? Condition { get; set; }
    public decimal? Price { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? VideoUrl { get; set; }
    public string? Style { get; set; }
    public string? Color { get; set; }
    // Seat as string
    public string? Seat { get; set; }
    public string? BatteryIncluded { get; set; }
    // Weight as string
    public string? Weight { get; set; }
    public string? LicensePlate { get; set; }
    public string? Origin { get; set; }
    public string? Fuel { get; set; }
    public string? Gearbox { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UserName { get; set; }

    // New fields
    public string? Version { get; set; }
    public string? Engine { get; set; }
    // OwnerCount as string
    public string? OwnerCount { get; set; }
    // InspectionValidUntil as bool
    public bool? InspectionValidUntil { get; set; }
    // Accessories as bool
    public bool? Accessories { get; set; }
    public string? BatteryType { get; set; }
    public string? Voltage { get; set; }
    public string? FrameMaterial { get; set; }
    public string? FrameSize { get; set; }
    public string? PartType { get; set; }
}
