using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class ItemDto
{
    public Guid ItemId { get; set; }
    public Guid? UserId { get; set; }
    public string? SerialNumber { get; set; }
    public string? ItemType { get; set; }
    public string? Title { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public int? Mileage { get; set; }
    public int? BatteryCapacity { get; set; }
    public int? Capacity { get; set; }
    public int? Cycles { get; set; }
    public string? Condition { get; set; }
    public decimal? Price { get; set; }
    public string? Images { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateItemDto
{
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string SerialNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string ItemType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Brand { get; set; }
    
    [StringLength(100)]
    public string? Model { get; set; }
    
    [Range(1900, 2030)]
    public int? Year { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? Mileage { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? BatteryCapacity { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? Capacity { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? Cycles { get; set; }
    
    [StringLength(50)]
    public string? Condition { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }
    
    public string? Images { get; set; }
    
    [StringLength(20)]
    public string Status { get; set; } = "Active";
}

public class UpdateItemDto
{
    [StringLength(100)]
    public string? SerialNumber { get; set; }
    
    [StringLength(50)]
    public string? ItemType { get; set; }
    
    [StringLength(255)]
    public string? Title { get; set; }
    
    [StringLength(100)]
    public string? Brand { get; set; }
    
    [StringLength(100)]
    public string? Model { get; set; }
    
    [Range(1900, 2030)]
    public int? Year { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? Mileage { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? BatteryCapacity { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? Capacity { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? Cycles { get; set; }
    
    [StringLength(50)]
    public string? Condition { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? Price { get; set; }
    
    public string? Images { get; set; }
    
    [StringLength(20)]
    public string? Status { get; set; }
}

public class ItemResponseDto
{
    public Guid ItemId { get; set; }
    public Guid? UserId { get; set; }
    public string? SerialNumber { get; set; }
    public string? ItemType { get; set; }
    public string? Title { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public int? Mileage { get; set; }
    public int? BatteryCapacity { get; set; }
    public int? Capacity { get; set; }
    public int? Cycles { get; set; }
    public string? Condition { get; set; }
    public decimal? Price { get; set; }
    public string? Images { get; set; }
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UserName { get; set; }
}
