using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IPaymentService
{
    Task<PaymentResponseDto> TopUpAsync(TopUpRequestDto dto);
    Task<PaymentResponseDto> PurchaseVipAsync(PurchaseVipRequestDto dto);
}
