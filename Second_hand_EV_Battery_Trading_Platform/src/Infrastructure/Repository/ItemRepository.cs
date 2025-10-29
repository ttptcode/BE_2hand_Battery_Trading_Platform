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
            .Include(i => i.ItemType)
            .Include(i => i.Images)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Item?> GetByIdAsync(Guid id)
    {
        return await _context.Items
            .Include(i => i.User)
            .Include(i => i.ItemType)
            .Include(i => i.Images)
            .Include(i => i.Listings)
            .FirstOrDefaultAsync(i => i.ItemId == id);
    }

    public async Task<Item?> GetBySerialNumberAsync(string serialNumber)
    {
        return await _context.Items
            .Include(i => i.User)
            .Include(i => i.ItemType)
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.SerialNumber == serialNumber);
    }

    public async Task<IEnumerable<Item>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Items
            .Include(i => i.User)
            .Include(i => i.ItemType)
            .Include(i => i.Images)
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> GetByStatusAsync(string status)
    {
        return await _context.Items
            .Include(i => i.User)
            .Include(i => i.ItemType)
            .Include(i => i.Images)
            .Where(i => i.Status == status)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> SearchAsync(string? title, string? brand, string? model, string? itemType)
    {
        var query = _context.Items
            .Include(i => i.User)
            .Include(i => i.ItemType)
            .Include(i => i.Images)
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
            query = query.Where(i => i.ItemType!.Name == itemType);
        }

        return await query
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Item>> SearchAdvancedAsync(string? title, string? brand, string? model, string? itemType, 
        string? style, string? color, string? origin, string? fuel, string? gearbox,
        string? version, string? engine, string? batteryType, string? voltage, string? frameMaterial, string? frameSize, string? partType)
    {
        var query = _context.Items
            .Include(i => i.User)
            .Include(i => i.ItemType)
            .Include(i => i.Images)
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
            query = query.Where(i => i.ItemType!.Name == itemType);
        }

        if (!string.IsNullOrEmpty(style))
        {
            query = query.Where(i => i.Style!.Contains(style));
        }

        if (!string.IsNullOrEmpty(color))
        {
            query = query.Where(i => i.Color!.Contains(color));
        }

        if (!string.IsNullOrEmpty(origin))
        {
            query = query.Where(i => i.Origin!.Contains(origin));
        }

        if (!string.IsNullOrEmpty(fuel))
        {
            query = query.Where(i => i.Fuel!.Contains(fuel));
        }

        if (!string.IsNullOrEmpty(gearbox))
        {
            query = query.Where(i => i.Gearbox!.Contains(gearbox));
        }

        // new filters
        if (!string.IsNullOrEmpty(version))
            query = query.Where(i => i.Version!.Contains(version));
        if (!string.IsNullOrEmpty(engine))
            query = query.Where(i => i.Engine!.Contains(engine));
        if (!string.IsNullOrEmpty(batteryType))
            query = query.Where(i => i.BatteryType!.Contains(batteryType));
        if (!string.IsNullOrEmpty(voltage))
            query = query.Where(i => i.Voltage!.Contains(voltage));
        if (!string.IsNullOrEmpty(frameMaterial))
            query = query.Where(i => i.FrameMaterial!.Contains(frameMaterial));
        if (!string.IsNullOrEmpty(frameSize))
            query = query.Where(i => i.FrameSize!.Contains(frameSize));
        if (!string.IsNullOrEmpty(partType))
            query = query.Where(i => i.PartType!.Contains(partType));

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

    public async Task<bool> ItemTypeExistsAsync(Guid itemTypeId)
    {
        return await _context.ItemTypes.AnyAsync(it => it.ItemTypeId == itemTypeId);
    }

    public async Task AddImagesAsync(Guid itemId, IEnumerable<ItemImage> images)
    {
        foreach (var image in images)
        {
            _context.ItemImages.Add(image);
        }
        await _context.SaveChangesAsync();
    }

    public async Task UpdateVideoUrlAsync(Guid itemId, string videoUrl)
    {
        var item = await _context.Items.FindAsync(itemId);
        if (item != null)
        {
            item.VideoUrl = videoUrl;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
    public async Task DeleteAllImagesByItemIdAsync(Guid itemId)
{
    // Tìm tất cả các bản ghi ItemImage có ItemId tương ứng
    var imagesToDelete = await _context.ItemImages
                                       .Where(img => img.ItemId == itemId)
                                       .ToListAsync();

    if (imagesToDelete.Any())
    {
        // Xóa chúng khỏi context
        _context.ItemImages.RemoveRange(imagesToDelete);
        
        // Lưu thay đổi vào database
        await _context.SaveChangesAsync();
    }
}

    public async Task DeleteImageAsync(Guid imageId)
    {
        var image = await _context.ItemImages.FindAsync(imageId);
        if (image != null)
        {
            _context.ItemImages.Remove(image);
            await _context.SaveChangesAsync();
        }
    }

    // Trong ItemRepository.cs
    public async Task<Item?> GetByIdWithImagesAsync(Guid itemId)
    {
        return await _context.Items
                             .Include(i => i.Images) // Eager loading
                             .FirstOrDefaultAsync(i => i.ItemId == itemId);
    }

    public async Task DeleteImagesAsync(IEnumerable<ItemImage> images)
    {
        _context.ItemImages.RemoveRange(images);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetImageCountAsync(Guid itemId)
    {
        return await _context.ItemImages.CountAsync(i => i.ItemId == itemId);
    }
}
