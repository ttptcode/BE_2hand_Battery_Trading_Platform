using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public class ChatService : IChatService
    {
        private readonly IConversationRepository _conversationRepo;
        private readonly IMessageRepository _messageRepo;

        public ChatService(IConversationRepository conversationRepo, IMessageRepository messageRepo)
        {
            _conversationRepo = conversationRepo;
            _messageRepo = messageRepo;
        }

        public async Task<IEnumerable<Conversation>> GetConversationsAsync(Guid userId)
        {
            return await _conversationRepo.GetByUserIdAsync(userId);
        }

        public async Task<IEnumerable<Message>> GetMessagesAsync(Guid conversationId)
        {
            return await _messageRepo.GetByConversationIdAsync(conversationId);
        }
        public async Task<Message> SendMessageAsync(Guid conversationId, Guid senderId, string content)
        {
            var message = new Message
            {
                MessageId = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderId = senderId,
                Content = content,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _messageRepo.AddAsync(message);
            return message;
        }
    }
}
