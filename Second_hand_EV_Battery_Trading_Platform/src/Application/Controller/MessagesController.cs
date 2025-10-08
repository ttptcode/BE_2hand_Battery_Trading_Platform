using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IChatService _chatService;

        public MessagesController(IChatService chatService)
        {
            _chatService = chatService;
        }

        // Lấy danh sách tin nhắn trong 1 conversation
        [HttpGet("{conversationId}")]
        public async Task<IActionResult> GetMessages(Guid conversationId)
        {
            var messages = await _chatService.GetMessagesAsync(conversationId);
            return Ok(messages.Select(m => new
            {
                m.MessageId,
                m.SenderId,
                m.Content,
                m.CreatedAt,
                m.IsRead
            }));
        }

        // Gửi tin nhắn
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var message = await _chatService.SendMessageAsync(request.ConversationId, request.SenderId, request.Content);
            return Ok(new
            {
                message.MessageId,
                message.SenderId,
                message.Content,
                message.CreatedAt
            });
        }
    }
    public record SendMessageRequest(Guid ConversationId, Guid SenderId, string Content);
}
