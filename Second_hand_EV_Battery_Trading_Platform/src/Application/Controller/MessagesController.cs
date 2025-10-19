using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(IChatService chatService, ILogger<MessagesController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tin nhắn trong 1 cuộc hội thoại
        /// </summary>
        [HttpGet("{conversationId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<object>>> GetMessages(Guid conversationId)
        {
            try
            {
                var messages = await _chatService.GetMessagesAsync(conversationId);

                if (messages == null || !messages.Any())
                    return Ok(ApiResponse<object>.SuccessResult(null, "No messages found"));

                var data = messages.Select(m => new
                {
                    m.MessageId,
                    m.SenderId,
                    m.Content,
                    m.CreatedAt,
                    m.IsRead
                });

                return Ok(ApiResponse<object>.SuccessResult(data, "Messages retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting messages for conversation {ConversationId}", conversationId);
                return StatusCode(500, ApiResponse<object>.ErrorResult(
                    "Internal server error while retrieving messages",
                    ex.Message));
            }
        }

        /// <summary>
        /// Gửi tin nhắn trong một cuộc hội thoại
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<object>>> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                var message = await _chatService.SendMessageAsync(request.ConversationId, request.SenderId, request.Content);

                if (message == null)
                    return BadRequest(ApiResponse<object>.ErrorResult("Failed to send message"));

                var data = new
                {
                    message.MessageId,
                    message.SenderId,
                    message.Content,
                    message.CreatedAt
                };

                return Ok(ApiResponse<object>.SuccessResult(data, "Message sent successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending message");
                return StatusCode(500, ApiResponse<object>.ErrorResult(
                    "Internal server error while sending message",
                    ex.Message));
            }
        }
    }

    public record SendMessageRequest(Guid ConversationId, Guid SenderId, string Content);
}
