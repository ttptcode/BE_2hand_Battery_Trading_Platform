using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class ItemTypeService : IItemTypeService
{
    private readonly IItemTypeRepository _itemTypeRepository;
    private readonly ILogger<ItemTypeService> _logger;

    public ItemTypeService(IItemTypeRepository itemTypeRepository, ILogger<ItemTypeService> logger)
    {
        _itemTypeRepository = itemTypeRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<ItemTypeDto>> GetAllAsync()
    {
        try
        {
            var itemTypes = await _itemTypeRepository.GetAllAsync();
            return itemTypes.Select(MapToDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all item types");
            throw;
        }
    }

    public async Task<ItemTypeDto?> GetByIdAsync(Guid id)
    {
        try
        {
            var itemType = await _itemTypeRepository.GetByIdAsync(id);
            return itemType == null ? null : MapToDto(itemType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting item type by id {ItemTypeId}", id);
            throw;
        }
    }

    public async Task<ItemTypeDto?> GetByNameAsync(string name)
    {
        try
        {
            var itemType = await _itemTypeRepository.GetByNameAsync(name);
            return itemType == null ? null : MapToDto(itemType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting item type by name {Name}", name);
            throw;
        }
    }

    public async Task<ItemTypeDto> CreateAsync(CreateItemTypeDto dto)
    {
        try
        {
            // Validate name is not empty
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("ItemType name cannot be empty");
            }

            // Check if name already exists
            if (await _itemTypeRepository.NameExistsAsync(dto.Name))
            {
                throw new InvalidOperationException($"ItemType with name '{dto.Name}' already exists");
            }

            var itemType = new ItemType
            {
                ItemTypeId = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim()
            };

            var created = await _itemTypeRepository.CreateAsync(itemType);
            _logger.LogInformation("ItemType created successfully: {ItemTypeId}", created.ItemTypeId);
            return MapToDto(created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item type");
            throw;
        }
    }

    public async Task<ItemTypeDto?> UpdateAsync(Guid id, UpdateItemTypeDto dto)
    {
        try
        {
            var itemType = await _itemTypeRepository.GetByIdAsync(id);
            if (itemType == null)
            {
                _logger.LogWarning("ItemType not found: {ItemTypeId}", id);
                return null;
            }

            // Check if new name already exists (excluding current item type)
            if (!string.IsNullOrWhiteSpace(dto.Name) && 
                await _itemTypeRepository.NameExistsAsync(dto.Name, id))
            {
                throw new InvalidOperationException($"ItemType with name '{dto.Name}' already exists");
            }

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(dto.Name))
                itemType.Name = dto.Name.Trim();

            if (dto.Description != null)
                itemType.Description = dto.Description.Trim();

            var updated = await _itemTypeRepository.UpdateAsync(itemType);
            _logger.LogInformation("ItemType updated successfully: {ItemTypeId}", updated.ItemTypeId);
            return MapToDto(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item type {ItemTypeId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var itemType = await _itemTypeRepository.GetByIdAsync(id);
            if (itemType == null)
            {
                _logger.LogWarning("ItemType not found: {ItemTypeId}", id);
                return false;
            }

            // Check if item type has any items
            if (itemType.Items.Any())
            {
                throw new InvalidOperationException(
                    $"Cannot delete ItemType '{itemType.Name}' because it has {itemType.Items.Count} associated items");
            }

            var deleted = await _itemTypeRepository.DeleteAsync(id);
            if (deleted)
            {
                _logger.LogInformation("ItemType deleted successfully: {ItemTypeId}", id);
            }
            return deleted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item type {ItemTypeId}", id);
            throw;
        }
    }

    private static ItemTypeDto MapToDto(ItemType itemType)
    {
        return new ItemTypeDto
        {
            ItemTypeId = itemType.ItemTypeId,
            Name = itemType.Name,
            Description = itemType.Description,
            CreatedAt = itemType.CreatedAt,
            UpdatedAt = itemType.UpdatedAt
        };
    }
}

