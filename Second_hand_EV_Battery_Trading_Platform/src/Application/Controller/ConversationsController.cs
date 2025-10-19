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
                    ItemId = c.ItemId,
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
                        .FirstOrDefault()?.Content ?? "(No messages yet)"
                });

                return Ok(ApiResponse<IEnumerable<ConversationResponseDto>>.SuccessResult(result, "Conversations retrieved successfully"));
            }
            catch (Exception ex)
            {
                // log lỗi nếu cần
                return StatusCode(500, ApiResponse<IEnumerable<ConversationResponseDto>>.ErrorResult("Internal server error", ex.Message));
            }
        }
    }
}
