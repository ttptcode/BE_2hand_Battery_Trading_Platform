using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public interface IChatService
    {
        Task<IEnumerable<Conversation>> GetConversationsAsync(Guid userId);
        Task<IEnumerable<Message>> GetMessagesAsync(Guid conversationId);
        Task<Message> SendMessageAsync(Guid conversationId, Guid senderId, string content);
        Task<Conversation> CreateConversationAsync(Guid listingId, Guid buyerId);
        Task<Conversation?> GetConversationByIdAsync(Guid conversationId);
        Task<bool> MarkMessageAsReadAsync(Guid messageId, Guid userId);
    }
}
