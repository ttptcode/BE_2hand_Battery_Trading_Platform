using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;

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

            // Cập nhật UpdatedAt của conversation = CreatedAt của message
            var conversation = await _conversationRepo.GetByIdAsync(conversationId);
            if (conversation != null)
            {
                conversation.UpdatedAt = message.CreatedAt;
                await _conversationRepo.UpdateAsync(conversation);
            }

            return message;
        }

        public async Task<Conversation> CreateConversationAsync(Guid listingId, Guid buyerId)
        {
            // Validate input parameters
            if (listingId == Guid.Empty)
            {
                throw new ArgumentException("Listing ID cannot be empty", nameof(listingId));
            }
            
            if (buyerId == Guid.Empty)
            {
                throw new ArgumentException("Buyer ID cannot be empty", nameof(buyerId));
            }

            // Check listing exists to determine seller and prevent self-conversation
            var listing = await _listingRepo.GetByIdAsync(listingId);
            if (listing == null)
            {
                throw new InvalidOperationException($"Listing with ID '{listingId}' not found");
            }

            // Check if listing has a valid seller
            if (!listing.UserId.HasValue)
            {
                throw new InvalidOperationException($"Listing with ID '{listingId}' does not have a valid seller");
            }

            // Prevent creating a conversation with oneself
            if (listing.UserId.Value == buyerId)
            {
                throw new InvalidOperationException("Cannot create a conversation with yourself. You cannot chat with yourself about your own listing.");
            }

            // Check if conversation already exists
            var existingConversation = await _conversationRepo.GetByListingIdAsync(listingId, buyerId);
            if (existingConversation != null)
            {
                return existingConversation;
            }

            // Create new conversation
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

        public async Task<Conversation?> GetConversationByIdAsync(Guid conversationId)
        {
            return await _conversationRepo.GetByIdAsync(conversationId);
        }

        public async Task<bool> MarkMessageAsReadAsync(Guid messageId, Guid userId)
        {
            try
            {
                var message = await _messageRepo.GetByIdAsync(messageId);
                if (message == null) return false;

                // Kiểm tra user có quyền đánh dấu tin nhắn này không
                if (!message.ConversationId.HasValue) return false;
                
                var conversation = await _conversationRepo.GetByIdAsync(message.ConversationId.Value);
                if (conversation == null) return false;

                if (conversation.BuyerId != userId && conversation.SellerId != userId)
                {
                    return false; // User không có quyền
                }

                message.IsRead = true;
                await _messageRepo.UpdateAsync(message);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
