using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IFeeCommissionService
{
    Task<IEnumerable<FeeCommissionResponseDto>> GetAllAsync();
    Task<FeeCommissionResponseDto?> GetByIdAsync(Guid id);
    Task<FeeCommissionResponseDto> CreateAsync(CreateFeeCommissionDto dto);
    Task<FeeCommissionResponseDto?> UpdateAsync(Guid id, UpdateFeeCommissionDto dto);
    Task<bool> DeleteAsync(Guid id);
}
