using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IItemService
{
    Task<IEnumerable<ItemResponseDto>> GetAllItemsAsync();
    Task<ItemResponseDto?> GetItemByIdAsync(Guid id);
    Task<IEnumerable<ItemResponseDto>> GetItemsByUserIdAsync(Guid userId);
    Task<IEnumerable<ItemResponseDto>> GetItemsByStatusAsync(string status);
    Task<IEnumerable<ItemResponseDto>> SearchItemsAsync(string? title, string? brand, string? model, string? itemType);
    Task<IEnumerable<ItemResponseDto>> SearchAdvancedAsync(string? title, string? brand, string? model, string? itemType, 
        string? style, string? color, string? origin, string? fuel, string? gearbox);
    Task<ItemResponseDto> CreateItemAsync(CreateItemDto createItemDto);
    Task<ItemResponseDto?> UpdateItemAsync(Guid id, UpdateItemDto updateItemDto);
    Task<bool> DeleteItemAsync(Guid id);
    Task<bool> ItemExistsAsync(Guid id);

    Task<ItemResponseDto?> UploadImagesAsync(Guid itemId, IEnumerable<IFormFile> files, string baseUrl, string webRootPath);
    Task<ItemResponseDto?> UploadVideoAsync(Guid itemId, IFormFile video, string baseUrl, string webRootPath);
}
