using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IPaymentTransactionRepository
{
    Task<PaymentTransaction> AddAsync(PaymentTransaction tx);
    Task<bool> HasActivePaidVipAsync(Guid userId, Guid feeId, int packageDurationDays);
    Task<int> CountListingsWithinVipWindowAsync(Guid userId, Guid feeId, DateTime windowStart);
}
