using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConversationsController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ConversationsController(IChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>
        /// lay danh sach cuoc tro chuyen cua user
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("{userId}")]
        [Authorize(Roles = "User")]

        public async Task<ActionResult<ApiResponse<IEnumerable<ConversationResponseDto>>>> GetConversations(Guid userId)
        {
            try
            {
                var conversations = await _chatService.GetConversationsAsync(userId);


                var result = conversations.Select(c => new ConversationResponseDto
                {
                    ConversationId = c.ConversationId,
                    ListingId = c.ListingId,
                    SellerId = c.SellerId,
                    BuyerId = c.BuyerId,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Status = c.Status,
                    Seller = c.Seller != null
                        ? new UserSummaryDto { UserId = c.Seller.UserId, FullName = c.Seller.FullName }
                        : null,
                    Buyer = c.Buyer != null
                        ? new UserSummaryDto { UserId = c.Buyer.UserId, FullName = c.Buyer.FullName }
                        : null,
                    LastMessage = c.Messages?
                        .OrderByDescending(m => m.CreatedAt)
                        .FirstOrDefault()?.Content ?? "(No messages yet)",
                    Listing = c.Listing != null ? new ListingSummaryDto
                    {
                        ListingId = c.Listing.ListingId,
                        ListingType = c.Listing.ListingType,
                        StartPrice = c.Listing.StartPrice,
                        BuyNowPrice = c.Listing.BuyNowPrice,
                        Status = c.Listing.Status,
                        Item = c.Listing.Item != null ? new ItemSummaryDto
                        {
                            ItemId = c.Listing.Item.ItemId,
                            Title = c.Listing.Item.Title,
                            Brand = c.Listing.Item.Brand,
                            Model = c.Listing.Item.Model,
                            Price = c.Listing.Item.Price,
                            Status = c.Listing.Item.Status
                        } : null
                    } : null
                });

                return Ok(ApiResponse<IEnumerable<ConversationResponseDto>>.SuccessResult(result, "Conversations retrieved successfully"));
            }
            catch (Exception ex)
            {
                // log lỗi nếu cần
                return StatusCode(500, ApiResponse<IEnumerable<ConversationResponseDto>>.ErrorResult("Internal server error", ex.Message));
            }
        }

        /// <summary>
        /// Tạo cuộc trò chuyện mới cho một listing
        /// </summary>
        /// <param name="listingId">ID của listing</param>
        /// <param name="buyerId">ID của người mua</param>
        /// <returns></returns>
        [HttpPost("create")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<ConversationResponseDto>>> CreateConversation(
            [FromQuery] Guid listingId, 
            [FromQuery] Guid buyerId)
        {
            try
            {
                var conversation = await _chatService.CreateConversationAsync(listingId, buyerId);
                var messages = await _chatService.GetMessagesAsync(conversation.ConversationId);

                var result = new ConversationResponseDto
                {
                    ConversationId = conversation.ConversationId,
                    ListingId = conversation.ListingId,
                    SellerId = conversation.SellerId,
                    BuyerId = conversation.BuyerId,
                    CreatedAt = conversation.CreatedAt,
                    UpdatedAt = conversation.UpdatedAt,
                    Status = conversation.Status,
                    Seller = conversation.Seller != null
                        ? new UserSummaryDto { UserId = conversation.Seller.UserId, FullName = conversation.Seller.FullName }
                        : null,
                    Buyer = conversation.Buyer != null
                        ? new UserSummaryDto { UserId = conversation.Buyer.UserId, FullName = conversation.Buyer.FullName }
                        : null,
                    LastMessage = messages?.OrderByDescending(m => m.CreatedAt).FirstOrDefault()?.Content ?? "(No messages yet)",
                    Listing = conversation.Listing != null ? new ListingSummaryDto
                    {
                        ListingId = conversation.Listing.ListingId,
                        ListingType = conversation.Listing.ListingType,
                        StartPrice = conversation.Listing.StartPrice,
                        BuyNowPrice = conversation.Listing.BuyNowPrice,
                        Status = conversation.Listing.Status,
                        Item = conversation.Listing.Item != null ? new ItemSummaryDto
                        {
                            ItemId = conversation.Listing.Item.ItemId,
                            Title = conversation.Listing.Item.Title,
                            Brand = conversation.Listing.Item.Brand,
                            Model = conversation.Listing.Item.Model,
                            Price = conversation.Listing.Item.Price,
                            Status = conversation.Listing.Item.Status
                        } : null
                    } : null
                };

                return Ok(ApiResponse<ConversationResponseDto>.SuccessResult(result, "Conversation created successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<ConversationResponseDto>.ErrorResult("Business logic error", ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<ConversationResponseDto>.ErrorResult("Internal server error", ex.Message));
            }
        }
    }
}
