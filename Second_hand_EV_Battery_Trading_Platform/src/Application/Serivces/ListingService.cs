using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class ListingService : IListingService
{
    private readonly IListingRepository _listingRepo;
    private readonly IItemRepository _itemRepo;
    private readonly IUserRepository _userRepo;
    private readonly IFeeCommissionRepository _feeRepo;

    public ListingService(
        IListingRepository listingRepo,
        IItemRepository itemRepo,
        IUserRepository userRepo,
        IFeeCommissionRepository feeRepo)
    {
        _listingRepo = listingRepo;
        _itemRepo = itemRepo;
        _userRepo = userRepo;
        _feeRepo = feeRepo;
    }

    public async Task<ListingResponseDto> CreateListingWithPaymentAsync(CreateListingDto dto)
    {
        // Validate user & item
        var user = await _userRepo.GetByIdAsync(dto.UserId) ?? throw new InvalidOperationException("User not found");
        var item = await _itemRepo.GetByIdAsync(dto.ItemId) ?? throw new InvalidOperationException("Item not found");

        // Validate item must have at least 5 images
        if (item.Images == null || item.Images.Count < 5)
        {
            throw new InvalidOperationException("Item must have at least 5 images to create a listing");
        }

        // Validate listing params
        if (dto.ListingType == ListingTypeDto.BuyNow)
        {
            if (dto.BuyNowPrice is null or <= 0) throw new InvalidOperationException("BuyNowPrice must be > 0");
        }
        else // Auction
        {
            if (dto.StartPrice is null or < 0) throw new InvalidOperationException("StartPrice invalid");
            if (dto.BidIncrement is null or <= 0) throw new InvalidOperationException("BidIncrement must be > 0");
            if (!dto.EndDate.HasValue || dto.EndDate <= dto.StartDate) throw new InvalidOperationException("EndDate invalid");
        }

        FeeCommission? fee = null;
        if (dto.FeeId.HasValue)
        {
            // Fee is optional; if provided attempt to load but do not enforce payment-related rules here
            fee = await _feeRepo.GetByIdAsync(dto.FeeId.Value);
        }

        // Compute listing duration. If a package duration is provided on the fee and no explicit EndDate is set,
        // use that duration. Otherwise honor dto.EndDate or leave null.
        var start = dto.StartDate ?? DateTime.UtcNow;
        DateTime? end = dto.EndDate;
        if (end == null && fee?.PackageDurationDays != null)
        {
            var dur = fee.PackageDurationDays ?? 0;
            if (dur > 0)
                end = start.AddDays(dur);
        }

        var listing = new Listing
        {
            ItemId = item.ItemId,
            UserId = user.UserId,
            FeeId = fee?.FeeId,
            ListingType = dto.ListingType.ToString(),
            StartDate = start,
            EndDate = end,
            StartPrice = dto.StartPrice,
            BuyNowPrice = dto.BuyNowPrice,
            BidIncrement = dto.BidIncrement,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _listingRepo.CreateAsync(listing);

        return new ListingResponseDto
        {
            ListingId = created.ListingId,
            ItemId = created.ItemId ?? Guid.Empty,
            UserId = created.UserId ?? Guid.Empty,
            ListingType = created.ListingType ?? "",
            BuyNowPrice = created.BuyNowPrice,
            StartPrice = created.StartPrice,
            BidIncrement = created.BidIncrement,
            StartDate = created.StartDate,
            EndDate = created.EndDate,
            Status = created.Status ?? "",
            FeeId = created.FeeId,
            CreatedAt = created.CreatedAt
        };
    }

    public async Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync()
        => (await _listingRepo.GetAllAsync()).Select(MapToResponse);

    public async Task<ListingResponseDto?> GetListingByListingIdAsync(Guid listingId)
    {
        var listing = await _listingRepo.GetByIdDetailedAsync(listingId);
        return listing is null ? null : MapToResponse(listing);
    }

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByUserIdAsync(Guid userId)
        => (await _listingRepo.GetByUserIdAsync(userId)).Select(MapToResponse);

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByListingTypeAsync(string listingType)
        => (await _listingRepo.GetByListingTypeAsync(listingType)).Select(MapToResponse);

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByItemIdAsync(Guid itemId)
        => (await _listingRepo.GetByItemIdAsync(itemId)).Select(MapToResponse);

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByStatusAsync(string status)
        => (await _listingRepo.GetByStatusAsync(status)).Select(MapToResponse);

    public async Task<IEnumerable<ListingResponseDto>> SearchListingsAsync(string? keyword, string? listingType, string? status)
        => (await _listingRepo.SearchAsync(keyword, listingType, status)).Select(MapToResponse);

    public async Task<ListingResponseDto?> UpdateListingAsync(UpdateListingDto dto)
    {
        var listing = await _listingRepo.GetByIdDetailedAsync(dto.ListingId);
        if (listing is null) return null;

        // Cập nhật STATUS (nếu có)
        if (!string.IsNullOrWhiteSpace(dto.Status))
            listing.Status = dto.Status;

        // Chỉ cho cập nhật các trường GIÁ theo loại listing hiện tại
        var isBuyNow = listing.ListingType?.Equals(nameof(ListingTypeDto.BuyNow), StringComparison.OrdinalIgnoreCase) ?? false;
        var isAuction = listing.ListingType?.Equals(nameof(ListingTypeDto.Auction), StringComparison.OrdinalIgnoreCase) ?? false;

        if (isBuyNow)
        {
            if (dto.BuyNowPrice.HasValue)
            {
                if (dto.BuyNowPrice.Value <= 0)
                    throw new InvalidOperationException("BuyNowPrice must be > 0.");
                listing.BuyNowPrice = dto.BuyNowPrice.Value;
            }

            // Không cho sửa StartPrice/BidIncrement ở chế độ BuyNow
            if (dto.StartPrice.HasValue || dto.BidIncrement.HasValue)
                throw new InvalidOperationException("Cannot update StartPrice/BidIncrement for BuyNow listing.");
        }
        else if (isAuction)
        {
            if (dto.StartPrice.HasValue)
            {
                if (dto.StartPrice.Value < 0)
                    throw new InvalidOperationException("StartPrice must be >= 0.");
                listing.StartPrice = dto.StartPrice.Value;
            }

            if (dto.BidIncrement.HasValue)
            {
                if (dto.BidIncrement.Value <= 0)
                    throw new InvalidOperationException("BidIncrement must be > 0.");
                listing.BidIncrement = dto.BidIncrement.Value;
            }

            // Không cho sửa BuyNowPrice ở chế độ Auction
            if (dto.BuyNowPrice.HasValue)
                throw new InvalidOperationException("Cannot update BuyNowPrice for Auction listing.");
        }
        else
        {
            throw new InvalidOperationException("ListingType is invalid.");
        }

        listing.UpdatedAt = DateTime.UtcNow;
        var saved = await _listingRepo.UpdateAsync(listing);
        return MapToResponse(saved);
    }

    public Task<bool> DeleteListingAsync(Guid listingId) => _listingRepo.DeleteAsync(listingId);

    private static ListingResponseDto MapToResponse(Listing l)
    {
        return new ListingResponseDto
        {
            ListingId = l.ListingId,
            ItemId = l.ItemId ?? Guid.Empty,
            UserId = l.UserId ?? Guid.Empty,
            ListingType = l.ListingType ?? "",
            BuyNowPrice = l.BuyNowPrice,
            StartPrice = l.StartPrice,
            BidIncrement = l.BidIncrement,
            StartDate = l.StartDate,
            EndDate = l.EndDate,
            Status = l.Status ?? "",
            FeeId = l.FeeId,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt,
            UserName = l.User?.FullName,
            ItemTitle = l.Item?.Title,
            FeeName = l.Fee?.FeeName
        };
    }
}