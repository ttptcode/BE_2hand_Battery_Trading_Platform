namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } = "User";
    }
}
