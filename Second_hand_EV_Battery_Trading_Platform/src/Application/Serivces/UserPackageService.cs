using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IUserPackageService
{
    Task<ApiResponse<UserPackageResponse>> PurchasePackageAsync(PurchasePackageRequest request);
    Task<ApiResponse<List<UserPackageResponse>>> GetUserPackagesAsync(Guid userId);
    Task<ApiResponse<List<UserPackageResponse>>> GetActiveUserPackagesAsync(Guid userId);
    Task<ApiResponse<UserPackageResponse>> GetUserPackageAsync(Guid userId, Guid feeId);
    Task<ApiResponse<bool>> ConsumeListingAsync(Guid userId, Guid feeId);
    Task<ApiResponse<int>> GetRemainingListingsAsync(Guid userId, Guid feeId);
}

public class UserPackageService : IUserPackageService
{
    private readonly IUserPackageRepository _userPackageRepository;
    private readonly OemEvWarrantyContext _context;

    public UserPackageService(IUserPackageRepository userPackageRepository, OemEvWarrantyContext context)
    {
        _userPackageRepository = userPackageRepository;
        _context = context;
    }

    public async Task<ApiResponse<UserPackageResponse>> PurchasePackageAsync(PurchasePackageRequest request)
    {
        try
        {
            // Kiểm tra FeeCommission có tồn tại không
            var feeCommission = await _context.FeeCommissions
                .FirstOrDefaultAsync(fc => fc.FeeId == request.FeeId);

            if (feeCommission == null)
            {
                return ApiResponse<UserPackageResponse>.ErrorResult("Fee package not found");
            }

            // Kiểm tra User có tồn tại không
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null)
            {
                return ApiResponse<UserPackageResponse>.ErrorResult("User not found");
            }

            // Kiểm tra User đã có package này chưa
            var existingPackage = await _userPackageRepository.GetUserPackageAsync(request.UserId, request.FeeId);
            if (existingPackage != null)
            {
                return ApiResponse<UserPackageResponse>.ErrorResult("User already has this package");
            }

            // Tạo UserPackage mới
            var userPackage = new UserPackage
            {
                UserId = request.UserId,
                FeeId = request.FeeId,
                RemainingListings = feeCommission.MaxListings ?? 0,
                ActivatedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(feeCommission.PackageDurationDays ?? 30),
                Status = "Active"
            };

            var createdPackage = await _userPackageRepository.CreateUserPackageAsync(userPackage);

            // Tạo response
            var response = new UserPackageResponse
            {
                UserId = createdPackage.UserId,
                FeeId = createdPackage.FeeId,
                RemainingListings = createdPackage.RemainingListings,
                ActivatedAt = createdPackage.ActivatedAt,
                ExpiredAt = createdPackage.ExpiredAt,
                Status = createdPackage.Status,
                FeeName = feeCommission.FeeName,
                FeeType = feeCommission.FeeType,
                Amount = feeCommission.Amount,
                PackageDurationDays = feeCommission.PackageDurationDays,
                MaxListings = feeCommission.MaxListings
            };

            return ApiResponse<UserPackageResponse>.SuccessResult(response, "Package purchased successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<UserPackageResponse>.ErrorResult($"Error purchasing package: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<UserPackageResponse>>> GetUserPackagesAsync(Guid userId)
    {
        try
        {
            var packages = await _userPackageRepository.GetUserPackagesAsync(userId);
            
            var responses = packages.Select(p => new UserPackageResponse
            {
                UserId = p.UserId,
                FeeId = p.FeeId,
                RemainingListings = p.RemainingListings,
                ActivatedAt = p.ActivatedAt,
                ExpiredAt = p.ExpiredAt,
                Status = p.Status,
                FeeName = p.FeeCommission?.FeeName,
                FeeType = p.FeeCommission?.FeeType,
                Amount = p.FeeCommission?.Amount,
                PackageDurationDays = p.FeeCommission?.PackageDurationDays,
                MaxListings = p.FeeCommission?.MaxListings
            }).ToList();

            return ApiResponse<List<UserPackageResponse>>.SuccessResult(responses, "User packages retrieved successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<UserPackageResponse>>.ErrorResult($"Error retrieving user packages: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<UserPackageResponse>>> GetActiveUserPackagesAsync(Guid userId)
    {
        try
        {
            var packages = await _userPackageRepository.GetActiveUserPackagesAsync(userId);
            
            var responses = packages.Select(p => new UserPackageResponse
            {
                UserId = p.UserId,
                FeeId = p.FeeId,
                RemainingListings = p.RemainingListings,
                ActivatedAt = p.ActivatedAt,
                ExpiredAt = p.ExpiredAt,
                Status = p.Status,
                FeeName = p.FeeCommission?.FeeName,
                FeeType = p.FeeCommission?.FeeType,
                Amount = p.FeeCommission?.Amount,
                PackageDurationDays = p.FeeCommission?.PackageDurationDays,
                MaxListings = p.FeeCommission?.MaxListings
            }).ToList();

            return ApiResponse<List<UserPackageResponse>>.SuccessResult(responses, "Active user packages retrieved successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<UserPackageResponse>>.ErrorResult($"Error retrieving active user packages: {ex.Message}");
        }
    }

    public async Task<ApiResponse<UserPackageResponse>> GetUserPackageAsync(Guid userId, Guid feeId)
    {
        try
        {
            var package = await _userPackageRepository.GetUserPackageAsync(userId, feeId);
            
            if (package == null)
            {
                return ApiResponse<UserPackageResponse>.ErrorResult("User package not found");
            }

            var response = new UserPackageResponse
            {
                UserId = package.UserId,
                FeeId = package.FeeId,
                RemainingListings = package.RemainingListings,
                ActivatedAt = package.ActivatedAt,
                ExpiredAt = package.ExpiredAt,
                Status = package.Status,
                FeeName = package.FeeCommission?.FeeName,
                FeeType = package.FeeCommission?.FeeType,
                Amount = package.FeeCommission?.Amount,
                PackageDurationDays = package.FeeCommission?.PackageDurationDays,
                MaxListings = package.FeeCommission?.MaxListings
            };

            return ApiResponse<UserPackageResponse>.SuccessResult(response, "User package retrieved successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<UserPackageResponse>.ErrorResult($"Error retrieving user package: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> ConsumeListingAsync(Guid userId, Guid feeId)
    {
        try
        {
            var success = await _userPackageRepository.ConsumeListingAsync(userId, feeId);
            
            if (!success)
            {
                return ApiResponse<bool>.ErrorResult("No available listings in package or package not found");
            }

            return ApiResponse<bool>.SuccessResult(true, "Listing consumed successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResult($"Error consuming listing: {ex.Message}");
        }
    }

    public async Task<ApiResponse<int>> GetRemainingListingsAsync(Guid userId, Guid feeId)
    {
        try
        {
            var remainingListings = await _userPackageRepository.GetRemainingListingsAsync(userId, feeId);
            return ApiResponse<int>.SuccessResult(remainingListings, "Remaining listings retrieved successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<int>.ErrorResult($"Error retrieving remaining listings: {ex.Message}");
        }
    }
}
