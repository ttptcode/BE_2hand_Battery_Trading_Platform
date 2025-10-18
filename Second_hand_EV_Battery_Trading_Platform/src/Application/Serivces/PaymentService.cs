using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class PaymentService : IPaymentService
{
    private readonly IUserRepository _userRepo;
    private readonly IFeeCommissionRepository _feeRepo;
    private readonly IPaymentTransactionRepository _payRepo;

    public PaymentService(
        IUserRepository userRepo,
        IFeeCommissionRepository feeRepo,
        IPaymentTransactionRepository payRepo)
    {
        _userRepo = userRepo;
        _feeRepo = feeRepo;
        _payRepo = payRepo;
    }

    public async Task<PaymentResponseDto> TopUpAsync(TopUpRequestDto dto)
    {
        // 1) Validate
        var user = await _userRepo.GetByIdAsync(dto.UserId)
                   ?? throw new InvalidOperationException("User not found");
        if (dto.Amount <= 0) throw new InvalidOperationException("Amount must be > 0");

        // 2) Nạp ví (giả định cổng thanh toán đã xác nhận Paid)
        user.Balance += dto.Amount;
        // Lưu user (giả định repo có UpdateAsync; nếu tên khác, sửa lại theo repo của em)
        await _userRepo.UpdateAsync(user);

        // 3) Ghi transaction (FeeId = null vì topup)
        var tx = await _payRepo.AddAsync(new PaymentTransaction
        {
            UserId = user.UserId,
            FeeId = null,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = "Paid",
            TransactionRef = dto.TransactionRef ?? $"TOPUP-{Guid.NewGuid()}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        return new PaymentResponseDto
        {
            PaymentId = tx.PaymentId,
            UserId = tx.UserId ?? Guid.Empty,
            FeeId = tx.FeeId,
            Amount = tx.Amount ?? 0,
            PaymentMethod = tx.PaymentMethod ?? "",
            PaymentStatus = tx.PaymentStatus ?? "",
            TransactionRef = tx.TransactionRef,
            CreatedAt = tx.CreatedAt
        };
    }

    public async Task<PaymentResponseDto> PurchaseVipAsync(PurchaseVipRequestDto dto)
    {
        // 1) Validate user + fee
        var user = await _userRepo.GetByIdAsync(dto.UserId)
                   ?? throw new InvalidOperationException("User not found");
        var fee = await _feeRepo.GetByIdAsync(dto.FeeId)
                  ?? throw new InvalidOperationException("Fee not found");
        if (!string.Equals(fee.FeeType, "VIP", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Fee must be VIP");

        var amount = fee.Amount ?? 0;
        if (amount <= 0) throw new InvalidOperationException("VIP amount invalid");

        // 2) Thanh toán: ví hoặc cổng
        if (string.Equals(dto.PaymentMethod, "Wallet", StringComparison.OrdinalIgnoreCase))
        {
            if (user.Balance < amount)
                throw new InvalidOperationException("Insufficient wallet balance");

            user.Balance -= amount;
            await _userRepo.UpdateAsync(user);
        }
        else
        {
            // Gateway: giả lập đã Paid, không động tới ví
        }

        // 3) Ghi transaction (FeeId = VIP Fee)
        var tx = await _payRepo.AddAsync(new PaymentTransaction
        {
            UserId = user.UserId,
            FeeId = fee.FeeId,
            Amount = amount,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = "Paid",
            TransactionRef = dto.TransactionRef ?? $"VIP-{Guid.NewGuid()}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        return new PaymentResponseDto
        {
            PaymentId = tx.PaymentId,
            UserId = tx.UserId ?? Guid.Empty,
            FeeId = tx.FeeId,
            Amount = tx.Amount ?? 0,
            PaymentMethod = tx.PaymentMethod ?? "",
            PaymentStatus = tx.PaymentStatus ?? "",
            TransactionRef = tx.TransactionRef,
            CreatedAt = tx.CreatedAt
        };
    }
}
