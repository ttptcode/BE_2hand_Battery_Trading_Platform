using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using System.Security.Claims;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    /// <summary>
    /// Kết nối user vào conversation group
    /// </summary>
    public async Task JoinConversation(string conversationId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized access");
                return;
            }

            // Kiểm tra user có quyền tham gia conversation này không
            var conversation = await _chatService.GetConversationByIdAsync(Guid.Parse(conversationId));
            if (conversation == null)
            {
                await Clients.Caller.SendAsync("Error", "Conversation not found");
                return;
            }

            if (conversation.BuyerId != userId && conversation.SellerId != userId)
            {
                await Clients.Caller.SendAsync("Error", "You don't have permission to join this conversation");
                return;
            }

            // Thêm user vào group của conversation
            await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
            
            _logger.LogInformation("User {UserId} joined conversation {ConversationId}", userId, conversationId);
            await Clients.Caller.SendAsync("JoinedConversation", conversationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining conversation {ConversationId}", conversationId);
            await Clients.Caller.SendAsync("Error", "Failed to join conversation");
        }
    }

    /// <summary>
    /// Rời khỏi conversation group
    /// </summary>
    public async Task LeaveConversation(string conversationId)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
            
            var userId = GetCurrentUserId();
            _logger.LogInformation("User {UserId} left conversation {ConversationId}", userId, conversationId);
            await Clients.Caller.SendAsync("LeftConversation", conversationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving conversation {ConversationId}", conversationId);
        }
    }

    /// <summary>
    /// Gửi tin nhắn real-time
    /// </summary>
    public async Task SendMessage(string conversationId, string content)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized access");
                return;
            }

            // Lưu tin nhắn vào database
            var message = await _chatService.SendMessageAsync(Guid.Parse(conversationId), userId.Value, content);
            
            if (message == null)
            {
                await Clients.Caller.SendAsync("Error", "Failed to send message");
                return;
            }

            // Gửi tin nhắn đến tất cả user trong conversation group
            var messageData = new
            {
                message.MessageId,
                SenderId = message.SenderId,
                message.Content,
                message.CreatedAt,
                message.IsRead,
                SenderName = message.Sender?.FullName ?? "Unknown"
            };

            await Clients.Group($"conversation_{conversationId}").SendAsync("ReceiveMessage", messageData);
            
            _logger.LogInformation("Message sent in conversation {ConversationId} by user {UserId}", conversationId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message in conversation {ConversationId}", conversationId);
            await Clients.Caller.SendAsync("Error", "Failed to send message");
        }
    }

    /// <summary>
    /// Đánh dấu tin nhắn đã đọc
    /// </summary>
    public async Task MarkAsRead(string conversationId, string messageId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return;

            var success = await _chatService.MarkMessageAsReadAsync(Guid.Parse(messageId), userId.Value);
            
            if (success)
            {
                await Clients.Group($"conversation_{conversationId}").SendAsync("MessageRead", new { MessageId = messageId, ReadBy = userId });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking message as read {MessageId}", messageId);
        }
    }

    /// <summary>
    /// Typing indicator
    /// </summary>
    public async Task StartTyping(string conversationId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return;

            await Clients.OthersInGroup($"conversation_{conversationId}").SendAsync("UserTyping", new { UserId = userId, IsTyping = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in StartTyping for conversation {ConversationId}", conversationId);
        }
    }

    /// <summary>
    /// Stop typing indicator
    /// </summary>
    public async Task StopTyping(string conversationId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return;

            await Clients.OthersInGroup($"conversation_{conversationId}").SendAsync("UserTyping", new { UserId = userId, IsTyping = false });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in StopTyping for conversation {ConversationId}", conversationId);
        }
    }

    /// <summary>
    /// Khi user kết nối
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("User {UserId} connected to SignalR", userId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Khi user ngắt kết nối
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("User {UserId} disconnected from SignalR", userId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Lấy UserId từ JWT token
    /// </summary>
    private Guid? GetCurrentUserId()
    {
        var userIdClaim = Context.User?.FindFirst("UserId")?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }
}
