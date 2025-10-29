using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IItemTypeRepository
{
    Task<IEnumerable<ItemType>> GetAllAsync();
    Task<ItemType?> GetByIdAsync(Guid id);
    Task<ItemType?> GetByNameAsync(string name);
    Task<ItemType> CreateAsync(ItemType itemType);
    Task<ItemType> UpdateAsync(ItemType itemType);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> NameExistsAsync(string name, Guid? excludeId = null);
}

