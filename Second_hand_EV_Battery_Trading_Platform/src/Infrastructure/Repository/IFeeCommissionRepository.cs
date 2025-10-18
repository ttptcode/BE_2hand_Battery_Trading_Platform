using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IFeeCommissionRepository
{
    Task<IEnumerable<FeeCommission>> GetAllAsync();
    Task<FeeCommission?> GetByIdAsync(Guid id);
    Task<FeeCommission> CreateAsync(FeeCommission fee);
    Task<FeeCommission> UpdateAsync(FeeCommission fee);
    Task<bool> DeleteAsync(Guid id);
}

