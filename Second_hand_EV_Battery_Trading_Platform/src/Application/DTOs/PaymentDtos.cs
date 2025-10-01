using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class TopUpRequestDto
{
    [Required] public Guid UserId { get; set; }

    // Chỉ cho phép Gateway để nạp tiền (Momo/VNPay...), nếu cần có thể mở rộng.
    [Required, RegularExpression("Gateway", ErrorMessage = "PaymentMethod must be 'Gateway' for topup")]
    public string PaymentMethod { get; set; } = "Gateway";

    [Required, Range(1, double.MaxValue, ErrorMessage = "Amount must be > 0")]
    public decimal Amount { get; set; }

    // Mã giao dịch từ cổng (optional, mock)
    public string? TransactionRef { get; set; }
}

public class PurchaseVipRequestDto
{
    [Required] public Guid UserId { get; set; }
    [Required] public Guid FeeId { get; set; } // trỏ tới FeeCommission (FeeType phải là VIP)

    // "Wallet" (trừ ví) hoặc "Gateway" (thanh toán cổng)
    [Required, RegularExpression("Wallet|Gateway", ErrorMessage = "PaymentMethod must be 'Wallet' or 'Gateway'")]
    public string PaymentMethod { get; set; } = "Wallet";

    public string? TransactionRef { get; set; }
}

public class PaymentResponseDto
{
    public Guid PaymentId { get; set; }
    public Guid UserId { get; set; }
    public Guid? FeeId { get; set; }  // null nếu topup
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "";
    public string PaymentStatus { get; set; } = "";
    public string? TransactionRef { get; set; }
    public DateTime? CreatedAt { get; set; }
}
