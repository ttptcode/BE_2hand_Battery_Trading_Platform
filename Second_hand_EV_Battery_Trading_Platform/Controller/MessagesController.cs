using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Hubs;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
using System.Security.Claims;

namespace Second_hand_EV_Battery_Trading_Platform.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(IChatService chatService, IHubContext<ChatHub> hubContext, ILogger<MessagesController> logger)
        {
            _chatService = chatService;
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tin nhắn trong 1 cuộc hội thoại
        /// Khi endpoint này được gọi, các tin nhắn chưa đọc (IsRead = false) gửi bởi bên kia sẽ được đánh dấu là đã đọc
        /// </summary>
        [HttpGet("{conversationId}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<object>>> GetMessages(Guid conversationId)
        {
            try
            {
                var messages = (await _chatService.GetMessagesAsync(conversationId)).ToList();

                if (messages == null || !messages.Any())
                    return Ok(ApiResponse<object>.SuccessResult(null, "No messages found"));

                // Get current user id from claims (try common claim types)
                Guid? currentUserId = null;
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.Name);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsed))
                    currentUserId = parsed;

                // Mark messages as read for the current user: any message not sent by current user
                if (currentUserId.HasValue)
                {
                    var unreadFromOther = messages
                        .Where(m => (m.IsRead == null || m.IsRead == false) && m.SenderId.HasValue && m.SenderId.Value != currentUserId.Value)
                        .ToList();

                    foreach (var msg in unreadFromOther)
                    {
                        try
                        {
                            await _chatService.MarkMessageAsReadAsync(msg.MessageId, currentUserId.Value);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to mark message {MessageId} as read", msg.MessageId);
                        }
                    }

                    // reload messages to reflect updated IsRead states
                    messages = (await _chatService.GetMessagesAsync(conversationId)).ToList();
                }

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
        /// Lấy các tin nhắn chưa đọc mà người khác gửi tới user ở tất cả conversation của user
        /// Không đánh dấu IsRead ở endpoint này
        /// </summary>
        [HttpGet("incoming")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<object>>> GetIncomingMessages()
        {
            try
            {
                // Get current user id from claims
                Guid? currentUserId = null;
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.Name);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsed))
                    currentUserId = parsed;

                if (!currentUserId.HasValue)
                    return BadRequest(ApiResponse<object>.ErrorResult("Unable to determine current user id"));

                // Get all conversations for this user
                var conversations = await _chatService.GetConversationsAsync(currentUserId.Value);

                var unreadList = new List<object>();

                foreach (var conv in conversations)
                {
                    var msgs = (await _chatService.GetMessagesAsync(conv.ConversationId)).ToList();
                    if (msgs == null || !msgs.Any()) continue;

                    var incoming = msgs
                        .Where(m => m.SenderId.HasValue && m.SenderId.Value != currentUserId.Value && (m.IsRead == null || m.IsRead == false))
                        .OrderBy(m => m.CreatedAt)
                        .Select(m => new
                        {
                            conv.ConversationId,
                            m.MessageId,
                            m.SenderId,
                            m.Content,
                            m.CreatedAt,
                            m.IsRead
                        });

                    unreadList.AddRange(incoming);
                }

                return Ok(ApiResponse<object>.SuccessResult(unreadList, "Incoming unread messages retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting incoming messages for user");
                return StatusCode(500, ApiResponse<object>.ErrorResult(
                    "Internal server error while retrieving incoming messages",
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

                // Broadcast to conversation group via SignalR
                try
                {
                    await _hubContext.Clients.Group(request.ConversationId.ToString()).SendAsync("ReceiveMessage", new
                    {
                        request.ConversationId,
                        Message = data
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send real-time message to group {ConversationId}", request.ConversationId);
                }

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
