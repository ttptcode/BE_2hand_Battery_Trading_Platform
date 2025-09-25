using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class ItemRepository : IItemRepository
{
    private readonly OemEvWarrantyContext _context;

    public ItemRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Item>> GetAllAsync()
    {
        return await _context.Items
            .Include(i => i.User)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Item?> GetByIdAsync(Guid id)
    {
        return await _context.Items
            .Include(i => i.User)
            .Include(i => i.Listings)
            .Include(i => i.Conversations)
            .FirstOrDefaultAsync(i => i.ItemId == id);
    }

    public async Task<Item?> GetBySerialNumberAsync(string serialNumber)
    {
        return await _context.Items
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.SerialNumber == serialNumber);
    }

    public async Task<IEnumerable<Item>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Items
            .Include(i => i.User)
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> GetByStatusAsync(string status)
    {
        return await _context.Items
            .Include(i => i.User)
            .Where(i => i.Status == status)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> SearchAsync(string? title, string? brand, string? model, string? itemType)
    {
        var query = _context.Items
            .Include(i => i.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(title))
        {
            query = query.Where(i => i.Title!.Contains(title));
        }

        if (!string.IsNullOrEmpty(brand))
        {
            query = query.Where(i => i.Brand!.Contains(brand));
        }

        if (!string.IsNullOrEmpty(model))
        {
            query = query.Where(i => i.Model!.Contains(model));
        }

        if (!string.IsNullOrEmpty(itemType))
        {
            query = query.Where(i => i.ItemType == itemType);
        }

        return await query
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Item> CreateAsync(Item item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        
        _context.Items.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<Item> UpdateAsync(Item item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        
        _context.Items.Update(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
            return false;

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Items.AnyAsync(i => i.ItemId == id);
    }

    public async Task<bool> SerialNumberExistsAsync(string serialNumber, Guid? excludeId = null)
    {
        var query = _context.Items.Where(i => i.SerialNumber == serialNumber);
        
        if (excludeId.HasValue)
        {
            query = query.Where(i => i.ItemId != excludeId.Value);
        }

        return await query.AnyAsync();
    }
}
