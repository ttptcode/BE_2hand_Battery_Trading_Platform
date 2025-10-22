using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    public class ChatService : IChatService
    {
        private readonly IConversationRepository _conversationRepo;
        private readonly IMessageRepository _messageRepo;
        private readonly IListingRepository _listingRepo;

        public ChatService(IConversationRepository conversationRepo, IMessageRepository messageRepo, IListingRepository listingRepo)
        {
            _conversationRepo = conversationRepo;
            _messageRepo = messageRepo;
            _listingRepo = listingRepo;
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

        public async Task<Conversation> CreateConversationAsync(Guid listingId, Guid buyerId)
        {
            // First attempt to find an existing conversation
            var existingConversation = await _conversationRepo.GetByListingIdAsync(listingId, buyerId);
            if (existingConversation != null)
            {
                return existingConversation;
            }

            // Load listing to determine seller
            var listing = await _listingRepo.GetByIdAsync(listingId);
            if (listing == null)
            {
                throw new InvalidOperationException("Listing not found");
            }

            var conversation = new Conversation
            {
                ConversationId = Guid.NewGuid(),
                ListingId = listingId,
                SellerId = listing.UserId,
                BuyerId = buyerId,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };


                await _conversationRepo.AddAsync(conversation);
                return conversation;
            

        }
    }
}
