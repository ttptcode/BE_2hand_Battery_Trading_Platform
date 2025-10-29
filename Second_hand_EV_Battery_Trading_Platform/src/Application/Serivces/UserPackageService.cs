using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IUserPackageService
{
    Task<ApiResponse<UserPackageResponse>> PurchasePackageAsync(Guid userId, PurchasePackageRequest request);
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
    private readonly ILogger<UserPackageService> _logger;

    public UserPackageService(IUserPackageRepository userPackageRepository, OemEvWarrantyContext context, ILogger<UserPackageService> logger)
    {
        _userPackageRepository = userPackageRepository;
        _context = context;
        _logger = logger;   
    }

    public async Task<ApiResponse<UserPackageResponse>> PurchasePackageAsync(Guid userId, PurchasePackageRequest request)
    {
        try
        {
            // Kiểm tra FeeCommission có tồn tại không
            var feeCommission = await _context.FeeCommissions
                .FirstOrDefaultAsync(fc =>
                    fc.FeeId.ToString().Equals(request.FeeId.ToString(), StringComparison.OrdinalIgnoreCase)
                );

            //if (feeCommission == null)
            //{
            //    return ApiResponse<UserPackageResponse>.ErrorResult("Fee package not found");
            //    _logger.LogWarning("FeeCommission with ID {FeeId} not found", request.FeeId);
            //}

            //// Kiểm tra User có tồn tại không
            //var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            //if (user == null)
            //{
            //    return ApiResponse<UserPackageResponse>.ErrorResult("User not found");
            //    _logger.LogWarning("User with ID {UserId} not found", userId);  
            //}

            //// Kiểm tra Month hợp lệ
            //if (request.Month >= 0 )
            //{
            //    return ApiResponse<UserPackageResponse>.ErrorResult("Month must be >0");
            //    _logger.LogWarning("Invalid month {Month} for package purchase by user {UserId}", request.Month, userId);
            //}

            // Tính toán thời gian hết hạn dựa trên số tháng
            var packageDurationDays = (feeCommission.PackageDurationDays ?? 30) * request.Month;
            var totalAmount = (feeCommission.Amount ?? 0) * request.Month;

            // Tạo UserPackage mới
            var userPackage = new UserPackage
            {
                UserId = userId,
                FeeId = request.FeeId,
                RemainingListings = (feeCommission.MaxListings ?? 0) , 
                ActivatedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(packageDurationDays),
                Status = "Active"
            };

            _logger.LogInformation("Creating user package for user {UserId} with FeeId {FeeId} for {Months} months",
                userId, request.FeeId, request.Month);
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
                Month = request.Month,
                TotalAmount = totalAmount,
                FeeCommission = new FeeCommissionResponseDto
                {
                    FeeId = feeCommission.FeeId,
                    FeeName = feeCommission.FeeName,
                    FeeType = feeCommission.FeeType,
                    Amount = feeCommission.Amount,
                    PackageDurationDays = feeCommission.PackageDurationDays,
                    MaxListings = feeCommission.MaxListings,
                    SavingAmount = feeCommission.SavingAmount,
                    Description = feeCommission.Description,
                    CreatedAt = feeCommission.CreatedAt
                }
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
                Month = CalculateMonthFromDates(p.ActivatedAt, p.ExpiredAt),
                TotalAmount = p.FeeCommission?.Amount ?? 0,
                FeeCommission = p.FeeCommission != null ? new FeeCommissionResponseDto
                {
                    FeeId = p.FeeCommission.FeeId,
                    FeeName = p.FeeCommission.FeeName,
                    FeeType = p.FeeCommission.FeeType,
                    Amount = p.FeeCommission.Amount,
                    PackageDurationDays = p.FeeCommission.PackageDurationDays,
                    MaxListings = p.FeeCommission.MaxListings,
                    SavingAmount = p.FeeCommission.SavingAmount,
                    Description = p.FeeCommission.Description,
                    CreatedAt = p.FeeCommission.CreatedAt
                } : new FeeCommissionResponseDto()
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
                Month = CalculateMonthFromDates(p.ActivatedAt, p.ExpiredAt),
                TotalAmount = p.FeeCommission?.Amount ?? 0,
                FeeCommission = p.FeeCommission != null ? new FeeCommissionResponseDto
                {
                    FeeId = p.FeeCommission.FeeId,
                    FeeName = p.FeeCommission.FeeName,
                    FeeType = p.FeeCommission.FeeType,
                    Amount = p.FeeCommission.Amount,
                    PackageDurationDays = p.FeeCommission.PackageDurationDays,
                    MaxListings = p.FeeCommission.MaxListings,
                    SavingAmount = p.FeeCommission.SavingAmount,
                    Description = p.FeeCommission.Description,
                    CreatedAt = p.FeeCommission.CreatedAt
                } : new FeeCommissionResponseDto()
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
                Month = CalculateMonthFromDates(package.ActivatedAt, package.ExpiredAt),
                TotalAmount = package.FeeCommission?.Amount ?? 0,
                FeeCommission = package.FeeCommission != null ? new FeeCommissionResponseDto
                {
                    FeeId = package.FeeCommission.FeeId,
                    FeeName = package.FeeCommission.FeeName,
                    FeeType = package.FeeCommission.FeeType,
                    Amount = package.FeeCommission.Amount,
                    PackageDurationDays = package.FeeCommission.PackageDurationDays,
                    MaxListings = package.FeeCommission.MaxListings,
                    SavingAmount = package.FeeCommission.SavingAmount,
                    Description = package.FeeCommission.Description,
                    CreatedAt = package.FeeCommission.CreatedAt
                } : new FeeCommissionResponseDto()
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

    /// <summary>
    /// Tính số tháng dựa trên ngày kích hoạt và ngày hết hạn
    /// </summary>
    private static int CalculateMonthFromDates(DateTime activatedAt, DateTime expiredAt)
    {
        var totalDays = (expiredAt - activatedAt).TotalDays;
        var months = (int)Math.Ceiling(totalDays / 30.0);
        return Math.Max(1, months); // Đảm bảo tối thiểu là 1 tháng
    }
}
