using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IItemRepository
{
    Task<IEnumerable<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(Guid id);
    Task<Item?> GetBySerialNumberAsync(string serialNumber);
    Task<IEnumerable<Item>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Item>> GetByStatusAsync(string status);
    Task<IEnumerable<Item>> SearchAsync(string? title, string? brand, string? model, string? itemType);
    Task<Item> CreateAsync(Item item);
    Task<Item> UpdateAsync(Item item);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> SerialNumberExistsAsync(string serialNumber, Guid? excludeId = null);
}
