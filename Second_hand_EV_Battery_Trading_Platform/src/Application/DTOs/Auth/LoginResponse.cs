namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth
{
    public class LoginResponse
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }
}
