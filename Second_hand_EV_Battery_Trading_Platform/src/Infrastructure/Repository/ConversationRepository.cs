using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly OemEvWarrantyContext _context;

        public ConversationRepository(OemEvWarrantyContext context)
        {
            _context = context;
        }

        public async Task<Conversation?> GetByIdAsync(Guid id)
        {
            return await _context.Conversations
                                 .Include(c => c.Messages)
                                 .Include(c => c.Listing)
                                 .ThenInclude(l => l.Item)
                                 .FirstOrDefaultAsync(c => c.ConversationId == id);
        }

        public async Task<IEnumerable<Conversation>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Conversations
                                 .Where(c => c.SellerId == userId || c.BuyerId == userId)
                                 .Include(c => c.Seller)
                                 .Include(c => c.Buyer)
                                 .Include(c => c.Listing)
                                 .ThenInclude(l => l.Item)
                                 .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt))
                                 .ToListAsync();
        }

        public async Task<Conversation?> GetByListingIdAsync(Guid listingId, Guid buyerId)
        {
            return await _context.Conversations
                                 .Include(c => c.Listing)
                                 .ThenInclude(l => l.Item)
                                 .Include(c => c.Seller)
                                 .Include(c => c.Buyer)
                                 .FirstOrDefaultAsync(c => c.ListingId == listingId && c.BuyerId == buyerId);
        }

        public async Task AddAsync(Conversation conversation)
        {
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }
    }
}
