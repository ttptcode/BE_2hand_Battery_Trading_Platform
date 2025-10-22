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
        public Guid? ListingId { get; set; }
        public Guid? SellerId { get; set; }
        public Guid? BuyerId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Status { get; set; }
        public UserSummaryDto? Seller { get; set; }
        public UserSummaryDto? Buyer { get; set; }
        public string? LastMessage { get; set; }
        public ListingSummaryDto? Listing { get; set; }
    }

    public class ListingSummaryDto
    {
        public Guid ListingId { get; set; }
        public string? ListingType { get; set; }
        public decimal? StartPrice { get; set; }
        public decimal? BuyNowPrice { get; set; }
        public string? Status { get; set; }
        public ItemSummaryDto? Item { get; set; }
    }

    public class ItemSummaryDto
    {
        public Guid ItemId { get; set; }
        public string? Title { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public decimal? Price { get; set; }
        public string? Status { get; set; }
    }
}
