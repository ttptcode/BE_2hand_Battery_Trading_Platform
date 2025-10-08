using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public class MessageRepository : IMessageRepository
    {
        private readonly OemEvWarrantyContext _context;

        public MessageRepository(OemEvWarrantyContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Message>> GetByConversationIdAsync(Guid conversationId)
        {
            return await _context.Messages
                                 .Where(m => m.ConversationId == conversationId)
                                 .OrderBy(m => m.CreatedAt)
                                 .ToListAsync();
        }
    }
}
