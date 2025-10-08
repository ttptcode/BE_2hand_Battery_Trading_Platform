using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public interface IMessageRepository
    {
        Task AddAsync(Message message);
        Task<IEnumerable<Message>> GetByConversationIdAsync(Guid conversationId);
    }
}
