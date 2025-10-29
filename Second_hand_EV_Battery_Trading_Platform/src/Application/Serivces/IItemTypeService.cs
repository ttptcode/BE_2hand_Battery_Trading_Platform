using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IItemTypeService
{
    Task<IEnumerable<ItemTypeDto>> GetAllAsync();
    Task<ItemTypeDto?> GetByIdAsync(Guid id);
    Task<ItemTypeDto?> GetByNameAsync(string name);
    Task<ItemTypeDto> CreateAsync(CreateItemTypeDto dto);
    Task<ItemTypeDto?> UpdateAsync(Guid id, UpdateItemTypeDto dto);
    Task<bool> DeleteAsync(Guid id);
}

