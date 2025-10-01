using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class FeeCommissionRepository : IFeeCommissionRepository
{
    private readonly OemEvWarrantyContext _ctx;
    public FeeCommissionRepository(OemEvWarrantyContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<FeeCommission>> GetAllAsync()
        => await _ctx.FeeCommissions.OrderByDescending(f => f.CreatedAt).ToListAsync();

    public async Task<FeeCommission?> GetByIdAsync(Guid id)
        => await _ctx.FeeCommissions.FirstOrDefaultAsync(f => f.FeeId == id);

    public async Task<FeeCommission> CreateAsync(FeeCommission fee)
    {
        fee.FeeId = Guid.NewGuid();
        fee.CreatedAt = DateTime.UtcNow;
        _ctx.FeeCommissions.Add(fee);
        await _ctx.SaveChangesAsync();
        return fee;
    }

    public async Task<FeeCommission> UpdateAsync(FeeCommission fee)
    {
        _ctx.FeeCommissions.Update(fee);
        await _ctx.SaveChangesAsync();
        return fee;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var fee = await _ctx.FeeCommissions.FindAsync(id);
        if (fee == null) return false;
        _ctx.FeeCommissions.Remove(fee);
        await _ctx.SaveChangesAsync();
        return true;
    }
}
