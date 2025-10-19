namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs
{
    public class ConversationDTO
    {
    }
    public class UserSummaryDto
    {
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
    }


    public class ConversationResponseDto
    {
        public Guid ConversationId { get; set; }
        public Guid? ItemId { get; set; }
        public Guid? SellerId { get; set; }
        public Guid? BuyerId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Status { get; set; }
        public UserSummaryDto? Seller { get; set; }
        public UserSummaryDto? Buyer { get; set; }
        public string? LastMessage { get; set; }
    }
}
