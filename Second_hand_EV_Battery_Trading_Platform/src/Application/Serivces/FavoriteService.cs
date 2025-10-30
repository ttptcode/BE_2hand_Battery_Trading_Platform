using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IFavoriteRepository _repo;

        public FavoriteService(IFavoriteRepository repo)
        {
            _repo = repo;
        }

        public async Task<FavoriteResponseDto> CreateFavoriteAsync(CreateFavoriteDto dto)
        {
            var entity = new Favorite
            {
                FavoriteId = Guid.NewGuid(),
                UserId = dto.UserId,
                ListingId = dto.ListingId,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.CreateAsync(entity);

            return MapToDto(created);
        }

        public async Task<IEnumerable<FavoriteResponseDto>> GetFavoritesByUserAsync(Guid userId)
        {
            var list = await _repo.GetByUserIdAsync(userId);
            return list.Select(MapToDto);
        }

        public async Task<bool> DeleteFavoriteAsync(Guid id)
        {
            return await _repo.DeleteAsync(id);
        }

        private FavoriteResponseDto MapToDto(Favorite f)
        {
            return new FavoriteResponseDto
            {
                FavoriteId = f.FavoriteId,
                UserId = f.UserId ?? Guid.Empty,
                UserName = f.User?.FullName,
                ListingId = f.ListingId ?? Guid.Empty,
              
                CreatedAt = f.CreatedAt
            };
        }
    }
}
