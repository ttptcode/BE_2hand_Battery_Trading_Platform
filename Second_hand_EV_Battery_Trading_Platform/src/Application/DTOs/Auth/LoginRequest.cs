namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs.Auth
{
    public class LoginRequest
    {
       // map vào FullName trong DB
       
        public string Username { get; set; } = string.Empty; 
        public string Password { get; set; } = string.Empty;
    }
}
