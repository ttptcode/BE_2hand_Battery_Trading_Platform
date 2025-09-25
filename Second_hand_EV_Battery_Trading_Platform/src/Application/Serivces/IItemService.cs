using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IItemService
{
    Task<IEnumerable<ItemResponseDto>> GetAllItemsAsync();
    Task<ItemResponseDto?> GetItemByIdAsync(Guid id);
    Task<IEnumerable<ItemResponseDto>> GetItemsByUserIdAsync(Guid userId);
    Task<IEnumerable<ItemResponseDto>> GetItemsByStatusAsync(string status);
    Task<IEnumerable<ItemResponseDto>> SearchItemsAsync(string? title, string? brand, string? model, string? itemType);
    Task<ItemResponseDto> CreateItemAsync(CreateItemDto createItemDto);
    Task<ItemResponseDto?> UpdateItemAsync(Guid id, UpdateItemDto updateItemDto);
    Task<bool> DeleteItemAsync(Guid id);
    Task<bool> ItemExistsAsync(Guid id);
}
