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
        public async Task<FavoriteResponseDto> ToggleFavoriteAsync(ToggleFavoriteDto dto)
        {
            var existing = await _repo.GetByUserAndListingAsync(dto.UserId, dto.ListingId);

            if (existing != null)
            {
                // Đã tồn tại → bỏ yêu thích
                await _repo.DeleteAsync(existing.FavoriteId);
                return new FavoriteResponseDto
                {
                    FavoriteId = existing.FavoriteId,
                    UserId = existing.UserId ?? Guid.Empty,
                    UserName = existing.User?.FullName,
                    ListingId = existing.ListingId ?? Guid.Empty,
                    CreatedAt = existing.CreatedAt,
                    // ListingTitle = existing.Listing?.Title // nếu bạn muốn giữ lại
                };
            }

            // Chưa có → thêm yêu thích
            var entity = new Favorite
            {
                FavoriteId = Guid.NewGuid(),
                UserId = dto.UserId,
                ListingId = dto.ListingId,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.CreateAsync(entity);

            return new FavoriteResponseDto
            {
                FavoriteId = created.FavoriteId,
                UserId = created.UserId ?? Guid.Empty,
                UserName = created.User?.FullName,
                ListingId = created.ListingId ?? Guid.Empty,
                CreatedAt = created.CreatedAt
            };
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
