using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class PaymentTransactionRepository : IPaymentTransactionRepository
{
    private readonly OemEvWarrantyContext _ctx;
    public PaymentTransactionRepository(OemEvWarrantyContext ctx) => _ctx = ctx;

    public async Task<PaymentTransaction> AddAsync(PaymentTransaction tx)
    {
        tx.PaymentId = Guid.NewGuid();
        tx.CreatedAt = DateTime.UtcNow;
        tx.UpdatedAt = DateTime.UtcNow;
        _ctx.PaymentTransactions.Add(tx);
        await _ctx.SaveChangesAsync();
        return tx;
    }

    public async Task<bool> HasActivePaidVipAsync(Guid userId, Guid feeId, int packageDurationDays)
    {
        var since = DateTime.UtcNow.AddDays(-packageDurationDays);
        return await _ctx.PaymentTransactions.AnyAsync(t =>
            t.UserId == userId && t.FeeId == feeId &&
            t.PaymentStatus == "Paid" && t.CreatedAt >= since);
    }

    public async Task<int> CountListingsWithinVipWindowAsync(Guid userId, Guid feeId, DateTime windowStart)
    {
        return await _ctx.Listings.CountAsync(l =>
            l.UserId == userId && l.FeeId == feeId && l.CreatedAt >= windowStart);
    }

    public async Task<PaymentTransaction?> GetByTransactionRefAsync(string transactionRef)
    {
        return await _ctx.PaymentTransactions
            .FirstOrDefaultAsync(t => t.TransactionRef == transactionRef);
    }

    public async Task UpdateAsync(PaymentTransaction payment)
    {
        _ctx.PaymentTransactions.Update(payment);
        await _ctx.SaveChangesAsync();
    }

    public async Task<IEnumerable<PaymentTransaction>> GetPendingPaymentsAsync()
    {
        return await _ctx.PaymentTransactions
            .Where(t => t.PaymentStatus == "Pending")
            .ToListAsync();
    }
}
