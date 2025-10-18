using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

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

        // Lấy tất cả conversation của 1 user
        [HttpGet("{userId}")]
        
        public async Task<IActionResult> GetConversations(Guid userId)
        {
            try
            {
                var conversations = await _chatService.GetConversationsAsync(userId);

                if (conversations == null || !conversations.Any())
                    return NotFound(new { message = "No conversations found for this user." });

                var result = conversations.Select(c => new
                {
                    conversationId = c.ConversationId,
                    createdAt = c.CreatedAt,
                    status = c.Status,
                    seller = c.Seller != null
                        ? new { userId = c.Seller.UserId, fullName = c.Seller.FullName }
                        : null,
                    buyer = c.Buyer != null
                        ? new { userId = c.Buyer.UserId, fullName = c.Buyer.FullName }
                        : null,
                    lastMessage = c.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .FirstOrDefault()?.Content ?? "(No messages yet)"
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                // log lỗi nếu cần
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
