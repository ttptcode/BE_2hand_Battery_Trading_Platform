using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IListingService
{
    Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync();

    Task<ListingResponseDto?> GetListingByListingIdAsync(Guid listingId);

    Task<IEnumerable<ListingResponseDto>> GetListingsByUserIdAsync(Guid userId);

    Task<IEnumerable<ListingResponseDto>> GetListingsByListingTypeAsync(string listingType);

    Task<IEnumerable<ListingResponseDto>> GetListingsByItemIdAsync(Guid itemId);

    Task<IEnumerable<ListingResponseDto>> GetListingsByStatusAsync(string status);

    Task<IEnumerable<ListingResponseDto>> SearchListingsAsync(string? keyword, string? listingType, string? status);

    Task<ListingResponseDto> CreateListingWithPaymentAsync(CreateListingDto dto);

    Task<ListingResponseDto?> UpdateListingAsync(UpdateListingDto updateDto);

    Task<bool> DeleteListingAsync(Guid listingId);
}