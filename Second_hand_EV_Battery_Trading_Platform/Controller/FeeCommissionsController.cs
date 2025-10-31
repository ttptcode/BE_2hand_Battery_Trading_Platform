using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.Controller;

[ApiController]
[Route("api/[controller]")]
public class FeeCommissionsController : ControllerBase
{
    private readonly OemEvWarrantyContext _context;

    public FeeCommissionsController(OemEvWarrantyContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách tất cả FeeCommission
    /// </summary>
    /// <returns>Danh sách tất cả FeeCommission</returns>
    [HttpGet]
    [Authorize(Roles = "Admin,User")]


    public async Task<ActionResult<ApiResponse<List<FeeCommissionResponseDto>>>> GetAllFeeCommissions()
    {
        try
        {
            var feeCommissions = await _context.FeeCommissions
                .OrderBy(fc => fc.Amount)
                .ToListAsync();

            var feeCommissionDtos = feeCommissions.Select(fc => new FeeCommissionResponseDto
            {
                FeeId = fc.FeeId,
                FeeName = fc.FeeName,
                FeeType = fc.FeeType,
                Amount = fc.Amount,
                PackageDurationDays = fc.PackageDurationDays,
                MaxListings = fc.MaxListings,
                SavingAmount = fc.SavingAmount,
                Description = fc.Description,
                CreatedAt = fc.CreatedAt
            }).ToList();

            return Ok(ApiResponse<List<FeeCommissionResponseDto>>.SuccessResult(feeCommissionDtos, "Fee commissions retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<FeeCommissionResponseDto>>.ErrorResult($"Error retrieving fee commissions: {ex.Message}"));
        }
    }

    /// <summary>
    /// Lấy danh sách các gói có sẵn để mua (chỉ Package type)
    /// </summary>
    /// <returns>Danh sách các gói Package</returns>
    [HttpGet("packages")]
    [Authorize(Roles = "Admin,User")]
    public async Task<ActionResult<ApiResponse<List<FeeCommissionResponseDto>>>> GetAvailablePackages()
    {
        try
        {
            var packages = await _context.FeeCommissions
                .Where(fc => fc.FeeType == "Package") // Chỉ lấy các gói package
                .OrderBy(fc => fc.Amount)
                .ToListAsync();

            var packageDtos = packages.Select(p => new FeeCommissionResponseDto
            {
                FeeId = p.FeeId,
                FeeName = p.FeeName,
                FeeType = p.FeeType,
                Amount = p.Amount,
                PackageDurationDays = p.PackageDurationDays,
                MaxListings = p.MaxListings,
                SavingAmount = p.SavingAmount,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            }).ToList();

            return Ok(ApiResponse<List<FeeCommissionResponseDto>>.SuccessResult(packageDtos, "Available packages retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<FeeCommissionResponseDto>>.ErrorResult($"Error retrieving packages: {ex.Message}"));
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết một gói
    /// </summary>
    /// <param name="feeId">ID của gói</param>
    /// <returns>Thông tin chi tiết gói</returns>
    [HttpGet("{feeId}")]
    public async Task<ActionResult<ApiResponse<FeeCommissionResponseDto>>> GetPackage(Guid feeId)
    {
        try
        {
            var package = await _context.FeeCommissions
                .FirstOrDefaultAsync(fc => fc.FeeId == feeId);

            if (package == null)
            {
                return NotFound(ApiResponse<FeeCommissionResponseDto>.ErrorResult("Package not found"));
            }

            var packageDto = new FeeCommissionResponseDto
            {
                FeeId = package.FeeId,
                FeeName = package.FeeName,
                FeeType = package.FeeType,
                Amount = package.Amount,
                PackageDurationDays = package.PackageDurationDays,
                MaxListings = package.MaxListings,
                SavingAmount = package.SavingAmount,
                Description = package.Description,
                CreatedAt = package.CreatedAt
            };

            return Ok(ApiResponse<FeeCommissionResponseDto>.SuccessResult(packageDto, "Package retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<FeeCommissionResponseDto>.ErrorResult($"Error retrieving package: {ex.Message}"));
        }
    }

    /// <summary>
    /// Tạo FeeCommission mới
    /// </summary>
    /// <param name="request">Thông tin FeeCommission cần tạo</param>
    /// <returns>FeeCommission đã tạo</returns>
    [HttpPost]
    [Authorize(Roles = "Admin, User")]

    public async Task<ActionResult<ApiResponse<FeeCommissionResponseDto>>> CreateFeeCommission([FromBody] CreateFeeCommissionDto request)
    {
        try
        {
            var feeCommission = new FeeCommission
            {
                FeeId = Guid.NewGuid(),
                FeeName = request.FeeName,
                FeeType = request.FeeType,
                Amount = request.Amount,
                PackageDurationDays = request.PackageDurationDays,
                MaxListings = request.MaxListings,
                SavingAmount = request.SavingAmount,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.FeeCommissions.Add(feeCommission);
            await _context.SaveChangesAsync();

            var response = new FeeCommissionResponseDto
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
            };

            return CreatedAtAction(nameof(GetPackage), new { feeId = feeCommission.FeeId }, 
                ApiResponse<FeeCommissionResponseDto>.SuccessResult(response, "Fee commission created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<FeeCommissionResponseDto>.ErrorResult($"Error creating fee commission: {ex.Message}"));
        }
    }

    /// <summary>
    /// Cập nhật FeeCommission
    /// </summary>
    /// <param name="feeId">ID của FeeCommission</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>FeeCommission đã cập nhật</returns>
    [HttpPut("{feeId}")]
    [Authorize(Roles = "Admin")]

    public async Task<ActionResult<ApiResponse<FeeCommissionResponseDto>>> UpdateFeeCommission(Guid feeId, [FromBody] UpdateFeeCommissionDto request)
    {
        try
        {
            var feeCommission = await _context.FeeCommissions
                .FirstOrDefaultAsync(fc => fc.FeeId == feeId);

            if (feeCommission == null)
            {
                return NotFound(ApiResponse<FeeCommissionResponseDto>.ErrorResult("Fee commission not found"));
            }

            // Cập nhật các trường
            feeCommission.FeeName = request.FeeName ?? feeCommission.FeeName;
            feeCommission.FeeType = request.FeeType ?? feeCommission.FeeType;
            feeCommission.Amount = request.Amount ?? feeCommission.Amount;
            feeCommission.PackageDurationDays = request.PackageDurationDays ?? feeCommission.PackageDurationDays;
            feeCommission.MaxListings = request.MaxListings ?? feeCommission.MaxListings;
            feeCommission.SavingAmount = request.SavingAmount ?? feeCommission.SavingAmount;
            feeCommission.Description = request.Description ?? feeCommission.Description;

            await _context.SaveChangesAsync();

            var response = new FeeCommissionResponseDto
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
            };

            return Ok(ApiResponse<FeeCommissionResponseDto>.SuccessResult(response, "Fee commission updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<FeeCommissionResponseDto>.ErrorResult($"Error updating fee commission: {ex.Message}"));
        }
    }

    /// <summary>
    /// Xóa FeeCommission
    /// </summary>
    /// <param name="feeId">ID của FeeCommission</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{feeId}")]
    [Authorize(Roles = "Admin")]

    public async Task<ActionResult<ApiResponse<bool>>> DeleteFeeCommission(Guid feeId)
    {
        try
        {
            var feeCommission = await _context.FeeCommissions
                .FirstOrDefaultAsync(fc => fc.FeeId == feeId);

            if (feeCommission == null)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("Fee commission not found"));
            }

            // Soft delete: set status to false
            feeCommission.Status = false;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.SuccessResult(true, "Fee commission soft-deleted (status set to false) successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<bool>.ErrorResult($"Error deleting fee commission: {ex.Message}"));
        }
    }
}
