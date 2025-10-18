using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class FeeCommissionService : IFeeCommissionService
{
    private readonly IFeeCommissionRepository _repo;

    public FeeCommissionService(IFeeCommissionRepository repo) => _repo = repo;

    public async Task<IEnumerable<FeeCommissionResponseDto>> GetAllAsync()
    {
        var list = await _repo.GetAllAsync();
        return list.Select(MapToResponse);
    }

    public async Task<FeeCommissionResponseDto?> GetByIdAsync(Guid id)
    {
        var fee = await _repo.GetByIdAsync(id);
        return fee is null ? null : MapToResponse(fee);
    }

    public async Task<FeeCommissionResponseDto> CreateAsync(CreateFeeCommissionDto dto)
    {
        // Có thể thêm check logic VIP/Post ở đây (vd: VIP phải có PackageDurationDays, MaxListings)
        var entity = new FeeCommission
        {
            FeeName = dto.FeeName,
            FeeType = dto.FeeType,
            Amount = dto.Amount,
            PackageDurationDays = dto.PackageDurationDays,
            MaxListings = dto.MaxListings,
            SavingAmount = dto.SavingAmount,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repo.CreateAsync(entity);
        return MapToResponse(created);
    }

    public async Task<FeeCommissionResponseDto?> UpdateAsync(Guid id, UpdateFeeCommissionDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null) return null;

        if (!string.IsNullOrWhiteSpace(dto.FeeName)) entity.FeeName = dto.FeeName;
        if (!string.IsNullOrWhiteSpace(dto.FeeType)) entity.FeeType = dto.FeeType;
        if (dto.Amount.HasValue) entity.Amount = dto.Amount;
        if (dto.PackageDurationDays.HasValue) entity.PackageDurationDays = dto.PackageDurationDays;
        if (dto.MaxListings.HasValue) entity.MaxListings = dto.MaxListings;
        if (dto.SavingAmount.HasValue) entity.SavingAmount = dto.SavingAmount;
        if (dto.Description != null) entity.Description = dto.Description;


        var updated = await _repo.UpdateAsync(entity);
        return MapToResponse(updated);
    }

    public Task<bool> DeleteAsync(Guid id) => _repo.DeleteAsync(id);

    private static FeeCommissionResponseDto MapToResponse(FeeCommission f) => new()
    {
        FeeId = f.FeeId,
        FeeName = f.FeeName,
        FeeType = f.FeeType,
        Amount = f.Amount,
        PackageDurationDays = f.PackageDurationDays,
        MaxListings = f.MaxListings,
        SavingAmount = f.SavingAmount,
        Description = f.Description,
        CreatedAt = f.CreatedAt
    };
}
