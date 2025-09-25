using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

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
            ItemType = createItemDto.ItemType,
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
            Images = createItemDto.Images,
            Status = createItemDto.Status
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
        
        if (!string.IsNullOrEmpty(updateItemDto.ItemType))
            item.ItemType = updateItemDto.ItemType;
        
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
        
        if (updateItemDto.Images != null)
            item.Images = updateItemDto.Images;
        
        if (!string.IsNullOrEmpty(updateItemDto.Status))
            item.Status = updateItemDto.Status;

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

    private static ItemResponseDto MapToResponseDto(Item item)
    {
        return new ItemResponseDto
        {
            ItemId = item.ItemId,
            UserId = item.UserId,
            SerialNumber = item.SerialNumber,
            ItemType = item.ItemType,
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
            Images = item.Images,
            Status = item.Status,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt,
            UserName = item.User?.FullName
        };
    }
}
