using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<User> UpdateAsync(User user);
}
