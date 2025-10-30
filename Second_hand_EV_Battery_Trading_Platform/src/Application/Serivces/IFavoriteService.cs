using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public interface IFavoriteService
    {
        Task<FavoriteResponseDto> CreateFavoriteAsync(CreateFavoriteDto dto);
        Task<IEnumerable<FavoriteResponseDto>> GetFavoritesByUserAsync(Guid userId);
        Task<bool> DeleteFavoriteAsync(Guid id);
    }
}
