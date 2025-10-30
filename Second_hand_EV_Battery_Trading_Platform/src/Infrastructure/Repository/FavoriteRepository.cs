using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;
using System;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly OemEvWarrantyContext _context;

        public FavoriteRepository(OemEvWarrantyContext context)
        {
            _context = context;
        }

        public async Task<Favorite> CreateAsync(Favorite favorite)
        {
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            // Load lại để trả về kèm User + Listing
            return await _context.Favorites
                .Include(f => f.User)
                .Include(f => f.Listing)
                .FirstAsync(f => f.FavoriteId == favorite.FavoriteId);
        }

        public async Task<IEnumerable<Favorite>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Favorites
                .Include(f => f.User)
                .Include(f => f.Listing)
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var favorite = await _context.Favorites.FindAsync(id);
            if (favorite == null)
                return false;

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Favorite?> GetByIdAsync(Guid id)
        {
            return await _context.Favorites
                .Include(f => f.User)
                .Include(f => f.Listing)
                .FirstOrDefaultAsync(f => f.FavoriteId == id);
        }
    }
}
