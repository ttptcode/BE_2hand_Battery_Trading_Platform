using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
   
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPhoneAsync(string phone); // ?? thêm dòng này
    Task AddAsync(User user);
    Task<bool> ExistsByPhoneOrFullNameAsync(string phone, string fullName);
    IQueryable<User> Query();

}
