using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterRequest request);
        Task<User?> LoginAsync(LoginRequest request);
    }
}
