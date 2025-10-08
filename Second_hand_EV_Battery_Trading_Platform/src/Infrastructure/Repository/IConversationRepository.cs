using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByIdAsync(Guid id);
        Task<IEnumerable<Conversation>> GetByUserIdAsync(Guid userId);  // ✅ sửa lại IEnumerable
        Task AddAsync(Conversation conversation);
    }
}
