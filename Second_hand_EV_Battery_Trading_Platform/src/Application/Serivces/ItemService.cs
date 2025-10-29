using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
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
        string? style, string? color, string? origin, string? fuel, string? gearbox, string? version, string? engine, string? batteryType, string? voltage, string? frameMaterial, string? frameSize, string? partType)
    {
        var items = await _itemRepository.SearchAdvancedAsync(title, brand, model, itemType, style, color, origin, fuel, gearbox, version, engine, batteryType, voltage, frameMaterial, frameSize, partType);
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

        // Check if ItemType exists
        if (!await _itemRepository.ItemTypeExistsAsync(createItemDto.ItemTypeId))
        {
            throw new InvalidOperationException($"ItemType with ID '{createItemDto.ItemTypeId}' does not exist.");
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
            // Mileage is string now
            Mileage = createItemDto.Mileage,
            BatteryCapacity = createItemDto.BatteryCapacity,
            Capacity = createItemDto.Capacity,
            Cycles = createItemDto.Cycles,
            Condition = createItemDto.Condition,
            Price = createItemDto.Price,
            Style = createItemDto.Style,
            Color = createItemDto.Color,
            // Seat is string now
            Seat = createItemDto.Seat,
            BatteryIncluded = createItemDto.BatteryIncluded,
            // Weight is string now
            Weight = createItemDto.Weight,
            LicensePlate = createItemDto.LicensePlate,
            Origin = createItemDto.Origin,
            Fuel = createItemDto.Fuel,
            Gearbox = createItemDto.Gearbox,
            Status = "Chưa bán",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,

            // new fields
            Version = createItemDto.Version,
            Engine = createItemDto.Engine,
            // OwnerCount is string now
            OwnerCount = createItemDto.OwnerCount,
            // InspectionValidUntil is bool now
            InspectionValidUntil = createItemDto.InspectionValidUntil,
            // Accessories is bool now
            Accessories = createItemDto.Accessories,
            BatteryType = createItemDto.BatteryType,
            Voltage = createItemDto.Voltage,
            FrameMaterial = createItemDto.FrameMaterial,
            FrameSize = createItemDto.FrameSize,
            PartType = createItemDto.PartType
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
        
        // Mileage is string
        if (!string.IsNullOrEmpty(updateItemDto.Mileage))
            item.Mileage = updateItemDto.Mileage;
        
        if (updateItemDto.BatteryCapacity.HasValue)
            item.BatteryCapacity = updateItemDto.BatteryCapacity;
        
        // Capacity is string
        if (!string.IsNullOrEmpty(updateItemDto.Capacity))
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
        
        // Seat is string
        if (!string.IsNullOrEmpty(updateItemDto.Seat))
            item.Seat = updateItemDto.Seat;
        
        if (updateItemDto.BatteryIncluded != null)
            item.BatteryIncluded = updateItemDto.BatteryIncluded;
        
        // Weight is string
        if (!string.IsNullOrEmpty(updateItemDto.Weight))
            item.Weight = updateItemDto.Weight;
        
        if (updateItemDto.LicensePlate != null)
            item.LicensePlate = updateItemDto.LicensePlate;
        
        if (updateItemDto.Origin != null)
            item.Origin = updateItemDto.Origin;
        
        if (updateItemDto.Fuel != null)
            item.Fuel = updateItemDto.Fuel;
        
        if (updateItemDto.Gearbox != null)
            item.Gearbox = updateItemDto.Gearbox;

        // new fields
        if (updateItemDto.Version != null)
            item.Version = updateItemDto.Version;

        if (updateItemDto.Engine != null)
            item.Engine = updateItemDto.Engine;

        // OwnerCount is string
        if (!string.IsNullOrEmpty(updateItemDto.OwnerCount))
            item.OwnerCount = updateItemDto.OwnerCount;

        // InspectionValidUntil is bool?
        if (updateItemDto.InspectionValidUntil.HasValue)
            item.InspectionValidUntil = updateItemDto.InspectionValidUntil;

        // Accessories is bool?
        if (updateItemDto.Accessories.HasValue)
            item.Accessories = updateItemDto.Accessories;

        if (updateItemDto.BatteryType != null)
            item.BatteryType = updateItemDto.BatteryType;

        if (updateItemDto.Voltage != null)
            item.Voltage = updateItemDto.Voltage;

        if (updateItemDto.FrameMaterial != null)
            item.FrameMaterial = updateItemDto.FrameMaterial;

        if (updateItemDto.FrameSize != null)
            item.FrameSize = updateItemDto.FrameSize;

        if (updateItemDto.PartType != null)
            item.PartType = updateItemDto.PartType;


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

    // Trong ItemService.cs
    // Bạn sẽ cần inject ILogger<ItemService> _logger; vào constructor

    public async Task<ItemResponseDto?> UploadImagesAsync(Guid itemId, IEnumerable<IFormFile>? files, string baseUrl, string webRootPath, IEnumerable<string>? existingImageUrls = null)
    {
        // 1. LẤY ITEM VÀ CÁC ẢNH LIÊN QUAN (SỬA LỖI EAGER LOADING)
        var item = await _itemRepository.GetByIdWithImagesAsync(itemId); // Dùng phương thức mới
        if (item == null)
            return null;

        var newFiles = files?.ToList() ?? new List<IFormFile>();
        
        // Xử lý existingImageUrls
        List<string> urlsToKeep;
        
        if (existingImageUrls == null)
        {
            // Nếu existingImageUrls là null, giữ lại tất cả ảnh hiện tại
            urlsToKeep = item.Images.Select(img => img.Url).ToList();
        }
        else
        {
            // Nếu existingImageUrls không phải null (có thể là empty list hoặc có giá trị)
            // Chỉ giữ lại những ảnh có trong danh sách existingImageUrls
            urlsToKeep = existingImageUrls.ToList();
            
            // Kiểm tra xem các URL trong existingImageUrls có tồn tại trong database không
            if (urlsToKeep.Any())
            {
                foreach (var url in urlsToKeep)
                {
                    bool found = false;
                    foreach (var image in item.Images)
                    {
                        if (string.Equals(image.Url.TrimEnd('/'), url.TrimEnd('/'), StringComparison.OrdinalIgnoreCase))
                        {
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found)
                    {
                        throw new InvalidOperationException($"Image URL '{url}' not found in database for item {itemId}");
                    }
                }
            }
        }

        // 2. PHÂN LOẠI VÀ XÓA ẢNH CŨ
        if (item.Images.Any())
        {
            // Tạo danh sách ảnh cần xóa
            var imagesToDelete = new List<ItemImage>();
            
            // Duyệt qua tất cả ảnh hiện tại
            foreach (var image in item.Images)
            {
                bool shouldKeep = false;
                
                // Kiểm tra xem ảnh có nằm trong danh sách cần giữ lại không
                foreach (var urlToKeep in urlsToKeep)
                {
                    // So sánh không phân biệt hoa thường và bỏ qua các dấu / ở cuối URL
                    if (string.Equals(image.Url.TrimEnd('/'), urlToKeep.TrimEnd('/'), StringComparison.OrdinalIgnoreCase))
                    {
                        shouldKeep = true;
                        break;
                    }
                }
                
                // Nếu không nằm trong danh sách cần giữ lại, thêm vào danh sách cần xóa
                if (!shouldKeep)
                {
                    imagesToDelete.Add(image);
                }
            }

            // Nếu có ảnh cần xóa
            if (imagesToDelete.Any())
            {
                // Xóa file vật lý trước
                foreach (var image in imagesToDelete)
                {
                    try
                    {
                        var fileName = Path.GetFileName(new Uri(image.Url).AbsolutePath);
                        var filePath = Path.Combine(webRootPath, "uploads", "items", itemId.ToString(), fileName);
                        if (File.Exists(filePath))
                        {
                            File.Delete(filePath);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log lỗi nhưng không dừng quá trình
                        Console.WriteLine($"Error deleting image file for URL '{image.Url}': {ex.Message}");
                    }
                }

                // Xóa tất cả các bản ghi DB cần thiết trong một lần gọi
                await _itemRepository.DeleteImagesAsync(imagesToDelete);
                
                // Reload item sau khi xóa ảnh để đảm bảo dữ liệu mới nhất
                item = await _itemRepository.GetByIdWithImagesAsync(itemId);
                if (item == null)
                    return null;
            }
        }

        // 3. THÊM ẢNH MỚI
        var currentImageCount = await _itemRepository.GetImageCountAsync(itemId);
        var slotsAvailable = Math.Max(0, 10 - currentImageCount);

        if (newFiles.Any() && slotsAvailable > 0)
        {
            var itemDir = Path.Combine(webRootPath, "uploads", "items", itemId.ToString());
            Directory.CreateDirectory(itemDir);

            var imagesToAdd = new List<ItemImage>();
            foreach (var formFile in newFiles.Take(slotsAvailable))
            {
                if (formFile.Length <= 0) continue;

                var ext = Path.GetExtension(formFile.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(itemDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formFile.CopyToAsync(stream);
                }

                var relativeUrl = $"/uploads/items/{itemId}/{fileName}";
                var fullUrl = baseUrl?.TrimEnd('/') + relativeUrl;

                imagesToAdd.Add(new ItemImage
                {
                    ItemImageId = Guid.NewGuid(),
                    ItemId = item.ItemId,
                    Url = fullUrl,
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (imagesToAdd.Any())
            {
                await _itemRepository.AddImagesAsync(itemId, imagesToAdd);
            }
        }

        // 4. TRẢ VỀ DỮ LIỆU ĐÃ CẬP NHẬT
        var updatedItem = await _itemRepository.GetByIdWithImagesAsync(itemId);
        return MapToResponseDto(updatedItem!);
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
            UserName = item.User?.FullName,

            // new fields
            Version = item.Version,
            Engine = item.Engine,
            OwnerCount = item.OwnerCount,
            InspectionValidUntil = item.InspectionValidUntil,
            Accessories = item.Accessories,
            BatteryType = item.BatteryType,
            Voltage = item.Voltage,
            FrameMaterial = item.FrameMaterial,
            FrameSize = item.FrameSize,
            PartType = item.PartType
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
