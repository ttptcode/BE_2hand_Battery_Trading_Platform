namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs
{
     public class CreateFavoriteDto
    {
        public Guid UserId { get; set; }
        public Guid ListingId { get; set; }
    }

    public class FavoriteResponseDto
    {
        public Guid FavoriteId { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public Guid ListingId { get; set; }
     
        public DateTime? CreatedAt { get; set; }
    }
}
