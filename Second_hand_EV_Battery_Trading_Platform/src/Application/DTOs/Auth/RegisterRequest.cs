namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth
{
    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;   // map với registerData.username
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string IdentityCard { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Sex { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
