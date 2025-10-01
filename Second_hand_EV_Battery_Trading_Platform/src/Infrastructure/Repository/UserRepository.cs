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

    public async Task<User?> GetByFullNameAsync(string fullName)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.FullName == fullName);
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

    public async Task<bool> ExistsByEmailOrFullNameAsync(string email, string fullName)
    {
        return await _context.Users.AnyAsync(u => u.Email == email || u.FullName == fullName);
    }
}
