using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class ItemService : IItemService
{
    private readonly IItemRepository _itemRepository;
    private readonly IUserRepository _userRepository;

    public ItemService(IItemRepository itemRepository, IUserRepository userRepository)
    {
        _itemRepository = itemRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<ItemResponseDto>> GetAllItemsAsync()
    {
        var items = await _itemRepository.GetAllAsync();
        return items.Select(MapToResponseDto);
    }

    public async Task<ItemResponseDto?> GetItemByIdAsync(Guid id)
    {
        var item = await _itemRepository.GetByIdAsync(id);
        return item != null ? MapToResponseDto(item) : null;
    }

    public async Task<IEnumerable<ItemResponseDto>> GetItemsByUserIdAsync(Guid userId)
    {
        var items = await _itemRepository.GetByUserIdAsync(userId);
        return items.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ItemResponseDto>> GetItemsByStatusAsync(string status)
    {
        var items = await _itemRepository.GetByStatusAsync(status);
        return items.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ItemResponseDto>> SearchItemsAsync(string? title, string? brand, string? model, string? itemType)
    {
        var items = await _itemRepository.SearchAsync(title, brand, model, itemType);
        return items.Select(MapToResponseDto);
    }

    public async Task<IEnumerable<ItemResponseDto>> SearchAdvancedAsync(string? title, string? brand, string? model, string? itemType, 
        string? style, string? color, string? origin, string? fuel, string? gearbox)
    {
        var items = await _itemRepository.SearchAdvancedAsync(title, brand, model, itemType, style, color, origin, fuel, gearbox);
        return items.Select(MapToResponseDto);
    }

    public async Task<ItemResponseDto> CreateItemAsync(CreateItemDto createItemDto)
    {
        // Check if user exists
        if (!await _userRepository.ExistsAsync(createItemDto.UserId))
        {
            throw new InvalidOperationException($"User with ID '{createItemDto.UserId}' does not exist.");
        }

        // Check if serial number already exists
        if (await _itemRepository.SerialNumberExistsAsync(createItemDto.SerialNumber))
        {
            throw new InvalidOperationException($"Serial number '{createItemDto.SerialNumber}' already exists.");
        }

        var item = new Item
        {
            ItemId = Guid.NewGuid(),
            UserId = createItemDto.UserId,
            SerialNumber = createItemDto.SerialNumber,
            ItemTypeId = createItemDto.ItemTypeId,
            Title = createItemDto.Title,
            Brand = createItemDto.Brand,
            Model = createItemDto.Model,
            Year = createItemDto.Year,
            Mileage = createItemDto.Mileage,
            BatteryCapacity = createItemDto.BatteryCapacity,
            Capacity = createItemDto.Capacity,
            Cycles = createItemDto.Cycles,
            Condition = createItemDto.Condition,
            Price = createItemDto.Price,
            Style = createItemDto.Style,
            Color = createItemDto.Color,
            Seat = createItemDto.Seat,
            BatteryIncluded = createItemDto.BatteryIncluded,
            Weight = createItemDto.Weight,
            LicensePlate = createItemDto.LicensePlate,
            Origin = createItemDto.Origin,
            Fuel = createItemDto.Fuel,
            Gearbox = createItemDto.Gearbox,
            Status = createItemDto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };


        var createdItem = await _itemRepository.CreateAsync(item);
        return MapToResponseDto(createdItem);
    }

    public async Task<ItemResponseDto?> UpdateItemAsync(Guid id, UpdateItemDto updateItemDto)
    {
        var item = await _itemRepository.GetByIdAsync(id);
        if (item == null)
            return null;

        // Check if serial number already exists (excluding current item)
        if (!string.IsNullOrEmpty(updateItemDto.SerialNumber) && 
            await _itemRepository.SerialNumberExistsAsync(updateItemDto.SerialNumber, id))
        {
            throw new InvalidOperationException($"Serial number '{updateItemDto.SerialNumber}' already exists.");
        }

        // Update only provided fields
        if (!string.IsNullOrEmpty(updateItemDto.SerialNumber))
            item.SerialNumber = updateItemDto.SerialNumber;
        
        if (updateItemDto.ItemTypeId.HasValue)
            item.ItemTypeId = updateItemDto.ItemTypeId;
        
        if (!string.IsNullOrEmpty(updateItemDto.Title))
            item.Title = updateItemDto.Title;
        
        if (updateItemDto.Brand != null)
            item.Brand = updateItemDto.Brand;
        
        if (updateItemDto.Model != null)
            item.Model = updateItemDto.Model;
        
        if (updateItemDto.Year.HasValue)
            item.Year = updateItemDto.Year;
        
        if (updateItemDto.Mileage.HasValue)
            item.Mileage = updateItemDto.Mileage;
        
        if (updateItemDto.BatteryCapacity.HasValue)
            item.BatteryCapacity = updateItemDto.BatteryCapacity;
        
        if (updateItemDto.Capacity.HasValue)
            item.Capacity = updateItemDto.Capacity;
        
        if (updateItemDto.Cycles.HasValue)
            item.Cycles = updateItemDto.Cycles;
        
        if (updateItemDto.Condition != null)
            item.Condition = updateItemDto.Condition;
        
        if (updateItemDto.Price.HasValue)
            item.Price = updateItemDto.Price;

        // Update new fields
        if (updateItemDto.Style != null)
            item.Style = updateItemDto.Style;
        
        if (updateItemDto.Color != null)
            item.Color = updateItemDto.Color;
        
        if (updateItemDto.Seat.HasValue)
            item.Seat = updateItemDto.Seat;
        
        if (updateItemDto.BatteryIncluded != null)
            item.BatteryIncluded = updateItemDto.BatteryIncluded;
        
        if (updateItemDto.Weight.HasValue)
            item.Weight = updateItemDto.Weight;
        
        if (updateItemDto.LicensePlate != null)
            item.LicensePlate = updateItemDto.LicensePlate;
        
        if (updateItemDto.Origin != null)
            item.Origin = updateItemDto.Origin;
        
        if (updateItemDto.Fuel != null)
            item.Fuel = updateItemDto.Fuel;
        
        if (updateItemDto.Gearbox != null)
            item.Gearbox = updateItemDto.Gearbox;
        
        if (!string.IsNullOrEmpty(updateItemDto.Status))
            item.Status = updateItemDto.Status;

        // Update timestamp
        item.UpdatedAt = DateTime.UtcNow;

        var updatedItem = await _itemRepository.UpdateAsync(item);
        return MapToResponseDto(updatedItem);
    }

    public async Task<bool> DeleteItemAsync(Guid id)
    {
        return await _itemRepository.DeleteAsync(id);
    }

    public async Task<bool> ItemExistsAsync(Guid id)
    {
        return await _itemRepository.ExistsAsync(id);
    }

    public async Task<ItemResponseDto?> UploadImagesAsync(Guid itemId, IEnumerable<IFormFile> files, string baseUrl, string webRootPath)
    {
        var item = await _itemRepository.GetByIdAsync(itemId);
        if (item == null)
            return null;

        // Ensure directory exists: wwwroot/uploads/items/{itemId}
        var itemDir = Path.Combine(webRootPath, "uploads", "items", itemId.ToString());
        Directory.CreateDirectory(itemDir);

        // Current count and remaining slots
        var current = item.Images.Count;
        var remaining = Math.Max(0, 10 - current);
        if (remaining == 0)
        {
            return MapToResponseDto(item);
        }

        var newImages = new List<ItemImage>();

        foreach (var formFile in files.Take(remaining))
        {
            if (formFile.Length <= 0)
                continue;

            var ext = Path.GetExtension(formFile.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(itemDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await formFile.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/items/{itemId}/{fileName}";
            var fullUrl = baseUrl?.TrimEnd('/') + relativeUrl;

            newImages.Add(new ItemImage
            {
                ItemImageId = Guid.NewGuid(),
                ItemId = item.ItemId,
                Url = fullUrl,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Add new images to repository instead of modifying item.Images
        await _itemRepository.AddImagesAsync(itemId, newImages);
        
        // Reload item with updated images
        var updatedItem = await _itemRepository.GetByIdAsync(itemId);
        return MapToResponseDto(updatedItem);
    }
    private static ItemResponseDto MapToResponseDto(Item item)
    {
        return new ItemResponseDto
        {
            ItemId = item.ItemId,
            UserId = item.UserId,
            SerialNumber = item.SerialNumber,
            ItemTypeId = item.ItemTypeId,
            ItemTypeName = item.ItemType?.Name,
            Title = item.Title,
            Brand = item.Brand,
            Model = item.Model,
            Year = item.Year,
            Mileage = item.Mileage,
            BatteryCapacity = item.BatteryCapacity,
            Capacity = item.Capacity,
            Cycles = item.Cycles,
            Condition = item.Condition,
            Price = item.Price,
            ImageUrls = item.Images.Select(img => img.Url).ToList(),
            VideoUrl = item.VideoUrl,
            Style = item.Style,
            Color = item.Color,
            Seat = item.Seat,
            BatteryIncluded = item.BatteryIncluded,
            Weight = item.Weight,
            LicensePlate = item.LicensePlate,
            Origin = item.Origin,
            Fuel = item.Fuel,
            Gearbox = item.Gearbox,
            Status = item.Status,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            UserName = item.User?.FullName
        };
    }

    public async Task<ItemResponseDto?> UploadVideoAsync(Guid itemId, IFormFile video, string baseUrl, string webRootPath)
    {
        var item = await _itemRepository.GetByIdAsync(itemId);
        if (item == null)
            return null;

        // Ensure directory exists: wwwroot/uploads/items/{itemId}/videos
        var videoDir = Path.Combine(webRootPath, "uploads", "items", itemId.ToString(), "videos");
        Directory.CreateDirectory(videoDir);

        // Generate unique filename
        var ext = Path.GetExtension(video.FileName);
        var fileName = $"video_{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(videoDir, fileName);

        // Save video file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await video.CopyToAsync(stream);
        }

        // Update item with video URL
        var relativeUrl = $"/uploads/items/{itemId}/videos/{fileName}";
        var fullUrl = baseUrl?.TrimEnd('/') + relativeUrl;
        
        // Update only VideoUrl field
        await _itemRepository.UpdateVideoUrlAsync(itemId, fullUrl);
        
        // Reload item with updated video
        var updatedItem = await _itemRepository.GetByIdAsync(itemId);
        return MapToResponseDto(updatedItem);
    }
}
