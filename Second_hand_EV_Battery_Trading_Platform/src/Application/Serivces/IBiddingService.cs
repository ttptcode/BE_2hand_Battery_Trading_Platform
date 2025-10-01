using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public interface IBiddingService
{
    Task<PlaceProxyBidResponseDto> PlaceProxyBidAsync(PlaceProxyBidRequestDto request);
}


