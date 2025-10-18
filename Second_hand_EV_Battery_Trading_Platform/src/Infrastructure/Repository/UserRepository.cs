using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public class UserRepository : IUserRepository
{
    private readonly OemEvWarrantyContext _context;

    public UserRepository(OemEvWarrantyContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == id);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Users.AnyAsync(u => u.UserId == id);
    }

    public async Task<User?> GetByPhoneAsync(string phone)
    {
        return await _context.Users
            .Include(u => u.Role) // n?u c?n role
            .FirstOrDefaultAsync(u => u.Phone == phone);
    }
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsByPhoneOrFullNameAsync(string phone, string fullName)
    {
        return await _context.Users.AnyAsync(u => u.Phone == phone || u.FullName == fullName);
    }
    public IQueryable<User> Query()
    {
        return _context.Users.Include(u => u.Role);
    }
}
