using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class ListingService : IListingService
{
    private readonly IListingRepository _listingRepo;
    private readonly IItemRepository _itemRepo;
    private readonly IUserRepository _userRepo;
    private readonly IFeeCommissionRepository _feeRepo;
    private readonly IItemService _itemService;
    private readonly IUserPackageRepository _userPackageRepository;

    public ListingService(
        IListingRepository listingRepo,
        IItemRepository itemRepo,
        IUserRepository userRepo,
        IFeeCommissionRepository feeRepo,
        IItemService itemService,
        IUserPackageRepository userPackageRepo)
    {
        _listingRepo = listingRepo;
        _itemRepo = itemRepo;
        _userRepo = userRepo;
        _feeRepo = feeRepo;
        _itemService = itemService;
        _userPackageRepository = userPackageRepo;
    }
    private static readonly Guid DefaultFeeId = new Guid("c9078506-e289-4e76-ac52-bfbfab5aeb23");

    public async Task<ListingResponseDto> CreateItemWithListingAsync(Guid userId, CreateItemWithListingDto dto, string baseUrl, string webRootPath)
    {
        // 1. Tạo Item trước
        var createItemDto = new CreateItemDto
        {
            UserId = userId,
            SerialNumber = dto.SerialNumber,
            ItemTypeId = dto.ItemTypeId,
            Title = dto.Title,
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year,
            Mileage = dto.Mileage,
            BatteryCapacity = dto.BatteryCapacity,
            Capacity = dto.Capacity,
            Cycles = dto.Cycles,
            Condition = dto.Condition,
            Price = dto.Price,
            Style = dto.Style,
            Color = dto.Color,
            Seat = dto.Seat,
            BatteryIncluded = dto.BatteryIncluded,
            Weight = dto.Weight,
            LicensePlate = dto.LicensePlate,
            Origin = dto.Origin,
            Fuel = dto.Fuel,
            Gearbox = dto.Gearbox,

            // new fields
            Version = dto.Version,
            Engine = dto.Engine,
            OwnerCount = dto.OwnerCount,
            InspectionValidUntil = dto.InspectionValidUntil,
            Accessories = dto.Accessories,
            BatteryType = dto.BatteryType,
            Voltage = dto.Voltage,
            FrameMaterial = dto.FrameMaterial,
            FrameSize = dto.FrameSize,
            PartType = dto.PartType
        };

        var createdItem = await _itemService.CreateItemAsync(createItemDto);

        // 2. Upload ảnh nếu có
        if (dto.Images != null && dto.Images.Any())
        {
            await _itemService.UploadImagesAsync(createdItem.ItemId, dto.Images, baseUrl, webRootPath, null);
        }

        // 3. Upload video nếu có
        if (dto.Video != null)
        {
            await _itemService.UploadVideoAsync(createdItem.ItemId, dto.Video, baseUrl, webRootPath);
        }

        // 4. Tạo Listing với Item vừa tạo
        var createListingDto = new CreateListingDto
        {
            UserId = userId,
            ItemId = createdItem.ItemId,
            ListingType = dto.ListingType,
            BuyNowPrice = dto.BuyNowPrice,
            StartPrice = dto.StartPrice,
            BidIncrement = dto.BidIncrement,
            EndDate = dto.EndDate,
            FeeId = dto.FeeId,
            Detail = dto.Detail,
            Address = dto.Address,
            Warranty = dto.Warranty,
            YouAre = dto.YouAre // map YouAre from combined DTO
        };

        return await CreateListingWithPaymentAsync(createListingDto);
    }

    public async Task<ListingResponseDto> CreateListingWithPaymentAsync(CreateListingDto dto)
    {
        // Validate user & item
        var user = await _userRepo.GetByIdAsync(dto.UserId) ?? throw new InvalidOperationException("User not found");
        var item = await _itemRepo.GetByIdAsync(dto.ItemId) ?? throw new InvalidOperationException("Item not found");

        //// Validate item must have at least 5 images
        //if (item.Images == null || item.Images.Count <= 1)
        //{
        //    throw new InvalidOperationException("Item must have at least 1 images to create a listing");
        //}

        // Kiểm tra item đã có tin đăng nào chưa
        var existingListing = await _listingRepo.GetByItemIdAsync(dto.ItemId);
        if (existingListing.Any())
        {
            throw new InvalidOperationException("This item already has a listing");
        }

        // Validate listing params
        if (dto.ListingType == ListingTypeDto.BuyNow)
        {
            if (dto.BuyNowPrice is null or < 0) throw new InvalidOperationException("BuyNowPrice must be > 0");
        }
        else // Auction
        {
            if (dto.StartPrice is null or < 0) throw new InvalidOperationException("StartPrice invalid");
            if (dto.BidIncrement is null or <= 0) throw new InvalidOperationException("BidIncrement must be > 0");
            if (!dto.EndDate.HasValue || dto.EndDate <= DateTime.UtcNow) throw new InvalidOperationException("EndDate invalid");
        }

        UserPackage? fee = null;
        if (dto.FeeId.HasValue)
        {
            // Fee is optional; if provided attempt to load but do not enforce payment-related rules here
            fee = await _userPackageRepository.GetUserPackageAsync(dto.UserId, dto.FeeId.Value);
            if (fee == null)
                throw new InvalidOperationException("User do not have this package");

        }

        // Compute listing duration. If a package duration is provided on the fee and no explicit EndDate is set,
        // use that duration. Otherwise honor dto.EndDate or leave null.
        var start = DateTime.UtcNow;
        DateTime? end = dto.EndDate;
        //if (fee?.FeeCommission.PackageDurationDays != null)
        //{
        //    var dur = fee.FeeCommission.PackageDurationDays ?? 0;
        //    if (dur > 0)
        //        end = start.AddDays(dur);
        //}


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
                Status = "Draft",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Detail = dto.Detail,
                Address = dto.Address,
                Warranty = dto.Warranty,
                YouAre = dto.YouAre // map YouAre into entity
            };

        var created = await _listingRepo.CreateAsync(listing);

        // Cập nhật item status thành "Chưa bán"
        item.Status = "Chưa bán";
        await _itemRepo.UpdateAsync(item);

        return await MapToResponseAsync(created);
    }

    public async Task<IEnumerable<ListingResponseDto>> GetAllListingsAsync()
    {
        var listings = await _listingRepo.GetAllAsync();
        var responses = new List<ListingResponseDto>();
        
        foreach (var listing in listings)
        {
            responses.Add(await MapToResponseAsync(listing));
        }
        
        return responses;
    }

    public async Task<ListingResponseDto?> GetListingByListingIdAsync(Guid listingId)
    {
        var listing = await _listingRepo.GetByIdDetailedAsync(listingId);
        return listing is null ? null : await MapToResponseAsync(listing);
    }

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByUserIdAsync(Guid userId)
    {
        var listings = await _listingRepo.GetByUserIdAsync(userId);
        var responses = new List<ListingResponseDto>();
        
        foreach (var listing in listings)
        {
            responses.Add(await MapToResponseAsync(listing));
        }
        
        return responses;
    }

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByListingTypeAsync(string listingType)
    {
        var listings = await _listingRepo.GetByListingTypeAsync(listingType);
        var responses = new List<ListingResponseDto>();
        
        foreach (var listing in listings)
        {
            responses.Add(await MapToResponseAsync(listing));
        }
        
        return responses;
    }

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByItemIdAsync(Guid itemId)
    {
        var listings = await _listingRepo.GetByItemIdAsync(itemId);
        var responses = new List<ListingResponseDto>();
        
        foreach (var listing in listings)
        {
            responses.Add(await MapToResponseAsync(listing));
        }
        
        return responses;
    }

    public async Task<IEnumerable<ListingResponseDto>> GetListingsByStatusAsync(string status)
    {
        var listings = await _listingRepo.GetByStatusAsync(status);
        var responses = new List<ListingResponseDto>();
        
        foreach (var listing in listings)
        {
            responses.Add(await MapToResponseAsync(listing));
        }
        
        return responses;
    }

    public async Task<IEnumerable<ListingResponseDto>> SearchListingsAsync(string? keyword, string? listingType, string? status)
    {
        var listings = await _listingRepo.SearchAsync(keyword, listingType, status);
        var responses = new List<ListingResponseDto>();
        
        foreach (var listing in listings)
        {
            responses.Add(await MapToResponseAsync(listing));
        }
        
        return responses;
    }

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
            //if (dto.BuyNowPrice.HasValue)
            //{
            //    if (dto.BuyNowPrice.Value < 0)
            //        throw new InvalidOperationException("BuyNowPrice must be > 0.");


               listing.BuyNowPrice = dto.BuyNowPrice.Value;


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
                if (dto.BidIncrement.Value < 0)
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

        // Cập nhật thông tin bổ sung
        if (!string.IsNullOrWhiteSpace(dto.Detail))
            listing.Detail = dto.Detail;
        if (!string.IsNullOrWhiteSpace(dto.Address))
            listing.Address = dto.Address;
        if (!string.IsNullOrWhiteSpace(dto.Warranty))
            listing.Warranty = dto.Warranty;

        // map YouAre if provided
        if (!string.IsNullOrWhiteSpace(dto.YouAre))
            listing.YouAre = dto.YouAre;

        listing.UpdatedAt = DateTime.UtcNow;
        var saved = await _listingRepo.UpdateAsync(listing);
        return await MapToResponseAsync(saved);
    }

    public async Task<ListingResponseDto?> ToggleListingStatusAsync(Guid listingId)
    {
        var listing = await _listingRepo.GetByIdDetailedAsync(listingId);
        if (listing is null) return null;

        // Toggle giữa Draft và Active
        if (listing.Status?.Equals("Draft", StringComparison.OrdinalIgnoreCase) ?? false)
        {
            listing.Status = "Active";
            // When activating a listing set its StartDate to now
            listing.StartDate = DateTime.UtcNow;

            if (listing.FeeId == null)
            {
                listing.EndDate = DateTime.UtcNow.AddDays(7);
            }
            else
            {
                // Attempt to compute EndDate from fee package duration
                var fee = await _feeRepo.GetByIdAsync(listing.FeeId.Value);
                if (fee != null && fee.PackageDurationDays.HasValue && fee.FeeType != "Pay1v1")
                {
                    listing.EndDate = DateTime.UtcNow.AddDays(fee.PackageDurationDays.Value);
                    var consumed = await _userPackageRepository.ConsumeListingAsync(listing.UserId.Value, listing.FeeId.Value);
                    if (!consumed)
                    {
                        throw new InvalidOperationException("User package does not have remaining listing slots to activate this listing.");
                    }
                }
                else
                {
                    listing.EndDate = DateTime.UtcNow.AddDays(fee.PackageDurationDays.Value);
                    var userPackage = await _userPackageRepository.GetUserPackageAsync(listing.UserId.Value, listing.FeeId.Value);
                    if (userPackage == null)
                    {
                        throw new InvalidOperationException("User package not found for this listing.");
                    }
                    if (userPackage.RemainingListings== 1)
                    {
                        var deleted = await _userPackageRepository.DeleteUserPackageAsync(listing.UserId.Value, listing.FeeId.Value);
                    }
                    else await _userPackageRepository.ConsumeListingAsync(listing.UserId.Value, listing.FeeId.Value);
                }

                // Consume one listing slot from user's package. This will decrement remaining listings.
                if (!listing.UserId.HasValue)
                    throw new InvalidOperationException("Listing does not have an associated user to consume package from.");


            }

        }
        else if (listing.Status?.Equals("Active", StringComparison.OrdinalIgnoreCase) ?? false)
        {
            listing.Status = "Draft";
        }
        else
        {
            throw new InvalidOperationException($"Cannot toggle status for listing with status '{listing.Status}'. Only Draft and Active are allowed.");
        }

        listing.UpdatedAt = DateTime.UtcNow;
        var updated = await _listingRepo.UpdateAsync(listing);
        return await MapToResponseAsync(updated);
    }

    public Task<bool> DeleteListingAsync(Guid listingId) => _listingRepo.DeleteAsync(listingId);

    public async Task<ListingResponseDto?> UpdateItemWithListingAsync(Guid userId, UpdateItemWithListingDto dto, string baseUrl, string webRootPath)
    {
        // 1. Validate listing exists and belongs to user
        var listing = await _listingRepo.GetByIdDetailedAsync(dto.ListingId);
        if (listing == null)
            throw new InvalidOperationException($"Listing with ID {dto.ListingId} not found");

        if (listing.UserId != userId)
            throw new InvalidOperationException("You do not have permission to update this listing");

        // 2. Update Item
        var item = await _itemRepo.GetByIdAsync(dto.ItemId);
        if (item == null)
            throw new InvalidOperationException($"Item with ID {dto.ItemId} not found");

        if (item.UserId != userId)
            throw new InvalidOperationException("You do not have permission to update this item");

        // Update Item fields
        var updateItemDto = new UpdateItemDto
        {
            SerialNumber = dto.SerialNumber,
            ItemTypeId = dto.ItemTypeId,
            Title = dto.Title,
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year,
            Mileage = dto.Mileage,
            BatteryCapacity = dto.BatteryCapacity,
            Capacity = dto.Capacity,
            Cycles = dto.Cycles,
            Condition = dto.Condition,
            Price = dto.Price,
            Style = dto.Style,
            Color = dto.Color,
            Seat = dto.Seat,
            BatteryIncluded = dto.BatteryIncluded,
            Weight = dto.Weight,
            LicensePlate = dto.LicensePlate,
            Origin = dto.Origin,
            Fuel = dto.Fuel,
            Gearbox = dto.Gearbox,

            // new fields
            Version = dto.Version,
            Engine = dto.Engine,
            OwnerCount = dto.OwnerCount,
            InspectionValidUntil = dto.InspectionValidUntil,
            Accessories = dto.Accessories,
            BatteryType = dto.BatteryType,
            Voltage = dto.Voltage,
            FrameMaterial = dto.FrameMaterial,
            FrameSize = dto.FrameSize,
            PartType = dto.PartType
        };

        var updatedItem = await _itemService.UpdateItemAsync(dto.ItemId, updateItemDto);
        if (updatedItem == null)
            throw new InvalidOperationException("Failed to update item");

        // 3. Update ListingType nếu được cung cấp
        if (dto.ListingType.HasValue)
        {
            listing.ListingType = dto.ListingType.Value.ToString();
            
            // Validate giá theo ListingType mới
            //if (dto.ListingType.Value == ListingTypeDto.BuyNow)
            //{
            //    if (dto.BuyNowPrice < 0)
            //        throw new InvalidOperationException("BuyNowPrice must be >= 0 for BuyNow listing");
            //}
            //else if (dto.ListingType.Value == ListingTypeDto.Auction)
            //{
            //    if (dto.StartPrice  < 0)
            //        throw new InvalidOperationException("StartPrice must be >= 0 for Auction listing");
            //    if (dto.BidIncrement < 0)
            //        throw new InvalidOperationException("BidIncrement must be > 0 for Auction listing");
            //}
            
            // Save ListingType update
            listing.UpdatedAt = DateTime.UtcNow;
            await _listingRepo.UpdateAsync(listing);
        }

        // 4. Update Listing (other fields)
        var updateListingDto = new UpdateListingDto
        {
            ListingId = dto.ListingId,
            Status = dto.Status,
            BuyNowPrice = dto.BuyNowPrice,
            StartPrice = dto.StartPrice,
            BidIncrement = dto.BidIncrement,
            Detail = dto.Detail,
            Address = dto.Address,
            Warranty = dto.Warranty,
            YouAre = dto.YouAre // map YouAre when updating combined
        };

        var updatedListing = await UpdateListingAsync(updateListingDto);
        if (updatedListing == null)
            throw new InvalidOperationException("Failed to update listing");

        // 5. Handle file uploads if provided
        if ((dto.Images != null && dto.Images.Any()) || (dto.existingImageUrls != null))
        {
            await _itemService.UploadImagesAsync(dto.ItemId, dto.Images, baseUrl, webRootPath, dto.existingImageUrls);
        }

        if (dto.Video != null)
        {
            await _itemService.UploadVideoAsync(dto.ItemId, dto.Video, baseUrl, webRootPath);
        }

        // 6. Return updated listing
        return await GetListingByListingIdAsync(dto.ListingId);
    }

    public async Task<bool> DeleteItemWithListingAsync(Guid listingId)
    {
        // 1. Get listing to find ItemId
        var listing = await _listingRepo.GetByIdDetailedAsync(listingId);
        if (listing == null)
            return false;

        // 2. Delete Listing first
        var listingDeleted = await DeleteListingAsync(listingId);

        // 3. Update Item status back to "Chưa bán" (soft delete)
        var item = listing.Item;
        if (item != null)
        {
            item.Status = "Chưa bán";
            await _itemRepo.UpdateAsync(item);
        }

        return listingDeleted;
    }

    private async Task<ListingResponseDto> MapToResponseAsync(Listing l)
    {
        var response = new ListingResponseDto
        {
            ListingId = l.ListingId,
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
            FeeName = l.Fee?.FeeName,
            Detail = l.Detail,
            Address = l.Address,
            Warranty = l.Warranty,
            YouAre = l.YouAre // include YouAre in response mapping
        };

        // Map item details if available
        if (l.Item != null)
        {
            response.Item = await _itemService.GetItemByIdAsync(l.Item.ItemId);
        }

        return response;
    }

    public async Task<ListingResponseDto?> ToggleListingActiveInactiveAsync(Guid listingId)
    {
        var listing = await _listingRepo.GetByIdDetailedAsync(listingId);
        if (listing is null) return null;

        if (listing.Status?.Equals("Active", StringComparison.OrdinalIgnoreCase) ?? false)
        {
            listing.Status = "InActive";
        }
        else if (listing.Status?.Equals("InActive", StringComparison.OrdinalIgnoreCase) ?? false)
        {
            listing.Status = "Active";
        }
        else
        {
            throw new InvalidOperationException($"Cannot toggle Active/InActive for listing with status '{listing.Status}'. Only Active and InActive are allowed.");
        }

        listing.UpdatedAt = DateTime.UtcNow;
        var updated = await _listingRepo.UpdateAsync(listing);
        return await MapToResponseAsync(updated);
    }
}