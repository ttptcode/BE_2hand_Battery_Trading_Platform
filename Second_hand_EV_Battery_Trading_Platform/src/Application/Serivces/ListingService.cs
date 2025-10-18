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
    private readonly IPaymentTransactionRepository _payRepo;

    public ListingService(
        IListingRepository listingRepo,
        IItemRepository itemRepo,
        IUserRepository userRepo,
        IFeeCommissionRepository feeRepo,
        IPaymentTransactionRepository payRepo)
    {
        _listingRepo = listingRepo;
        _itemRepo = itemRepo;
        _userRepo = userRepo;
        _feeRepo = feeRepo;
        _payRepo = payRepo;
    }

    public async Task<ListingResponseDto> CreateListingWithPaymentAsync(CreateListingDto dto)
    {
        // Validate user & item
        var user = await _userRepo.GetByIdAsync(dto.UserId) ?? throw new InvalidOperationException("User not found");
        var item = await _itemRepo.GetByIdAsync(dto.ItemId) ?? throw new InvalidOperationException("Item not found");

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
            fee = await _feeRepo.GetByIdAsync(dto.FeeId.Value) ??
                  throw new InvalidOperationException("Fee/Package not found");
        }

        // Decide payment path
        decimal chargeAmount = 0;
        bool usingVip = false;
        DateTime? vipWindowStart = null;

        if (fee != null && string.Equals(fee.FeeType, "VIP", StringComparison.OrdinalIgnoreCase))
        {
            var days = fee.PackageDurationDays ?? 0;
            usingVip = true;
            vipWindowStart = DateTime.UtcNow.AddDays(-days);

            // must have paid VIP package and still active
            var hasActive = await _payRepo.HasActivePaidVipAsync(user.UserId, fee.FeeId, days);
            if (!hasActive) throw new InvalidOperationException("VIP package not active or expired");

            // check quota
            var used = await _payRepo.CountListingsWithinVipWindowAsync(user.UserId, fee.FeeId, vipWindowStart.Value);
            var quota = fee.MaxListings ?? 0;
            if (used >= quota) throw new InvalidOperationException("VIP package quota exceeded");
        }
        else if (fee != null && string.Equals(fee.FeeType, "Post", StringComparison.OrdinalIgnoreCase))
        {
            // normal per-listing fee
            chargeAmount = fee.Amount ?? 0;
        }
        else
        {
            // No fee provided -> treat as normal per-listing fee requires a default "Post" fee config
            throw new InvalidOperationException("FeeId is required (VIP or Post)");
        }

        // Handle wallet payment if needed
        if (!usingVip && chargeAmount > 0)
        {
            if (string.Equals(dto.PaymentMethod, "Wallet", StringComparison.OrdinalIgnoreCase))
            {
                if (user.Balance < chargeAmount)
                    throw new InvalidOperationException("Insufficient wallet balance. Please top up or choose payment gateway.");

                // Deduct
                user.Balance -= chargeAmount;

                // Record transaction
                await _payRepo.AddAsync(new PaymentTransaction
                {
                    UserId = user.UserId,
                    FeeId = fee!.FeeId,
                    Amount = chargeAmount,
                    PaymentMethod = "Wallet",
                    PaymentStatus = "Paid",
                    TransactionRef = $"WALLET-{Guid.NewGuid()}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else if (string.Equals(dto.PaymentMethod, "Gateway", StringComparison.OrdinalIgnoreCase))
            {
                // Ở đây tạm thời coi như đã thanh toán thành công (tích hợp VNPAY/Momo về sau)
                await _payRepo.AddAsync(new PaymentTransaction
                {
                    UserId = user.UserId,
                    FeeId = fee!.FeeId,
                    Amount = chargeAmount,
                    PaymentMethod = "Gateway",
                    PaymentStatus = "Paid",
                    TransactionRef = $"GATE-{Guid.NewGuid()}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                throw new InvalidOperationException("PaymentMethod must be Wallet or Gateway");
            }
        }

        // Compute listing duration
        var start = dto.StartDate ?? DateTime.UtcNow;
        DateTime? end = dto.EndDate;
        if (usingVip)
        {
            var dur = fee!.PackageDurationDays ?? 0;
            // Tin được giữ trong thời hạn gói
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