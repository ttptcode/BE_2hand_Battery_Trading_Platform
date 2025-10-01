using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<User?> GetByFullNameAsync(string fullName);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
    Task<bool> ExistsByEmailOrFullNameAsync(string email, string fullName);

}
