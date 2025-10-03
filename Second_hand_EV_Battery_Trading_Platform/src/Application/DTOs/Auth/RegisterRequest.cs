namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth
{
    public class RegisterRequest
    {
       
        public string FullName { get; set; } = string.Empty;
       
        public string PhoneNumber { get; set; } = string.Empty;
        
        public string Password { get; set; } = string.Empty;
    }
}
