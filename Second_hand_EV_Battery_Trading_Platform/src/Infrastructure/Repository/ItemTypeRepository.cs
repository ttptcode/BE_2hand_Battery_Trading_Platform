using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class ItemTypeRepository : IItemTypeRepository
{
    private readonly OemEvWarrantyContext _context;

    public ItemTypeRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ItemType>> GetAllAsync()
    {
        return await _context.ItemTypes
            .OrderBy(it => it.Name)
            .ToListAsync();
    }

    public async Task<ItemType?> GetByIdAsync(Guid id)
    {
        return await _context.ItemTypes
            .FirstOrDefaultAsync(it => it.ItemTypeId == id);
    }

    public async Task<ItemType?> GetByNameAsync(string name)
    {
        return await _context.ItemTypes
            .FirstOrDefaultAsync(it => it.Name == name);
    }

    public async Task<ItemType> CreateAsync(ItemType itemType)
    {
        itemType.CreatedAt = DateTime.UtcNow;
        itemType.UpdatedAt = DateTime.UtcNow;
        
        _context.ItemTypes.Add(itemType);
        await _context.SaveChangesAsync();
        return itemType;
    }

    public async Task<ItemType> UpdateAsync(ItemType itemType)
    {
        itemType.UpdatedAt = DateTime.UtcNow;
        
        _context.ItemTypes.Update(itemType);
        await _context.SaveChangesAsync();
        return itemType;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var itemType = await _context.ItemTypes.FindAsync(id);
        if (itemType == null)
            return false;

        _context.ItemTypes.Remove(itemType);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.ItemTypes.AnyAsync(it => it.ItemTypeId == id);
    }

    public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null)
    {
        var query = _context.ItemTypes.Where(it => it.Name == name);

        if (excludeId.HasValue)
        {
            query = query.Where(it => it.ItemTypeId != excludeId.Value);
        }

        return await query.AnyAsync();
    }
}

