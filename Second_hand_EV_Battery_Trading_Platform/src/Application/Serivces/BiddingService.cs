using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class BiddingService : IBiddingService
{
    private readonly IBidRepository _bidRepository;
    private readonly IListingRepository _listingRepository;
    private readonly IUserRepository _userRepository;

    public BiddingService(
        IBidRepository bidRepository,
        IListingRepository listingRepository,
        IUserRepository userRepository)
    {
        _bidRepository = bidRepository;
        _listingRepository = listingRepository;
        _userRepository = userRepository;
    }

    public async Task<PlaceProxyBidResponseDto> PlaceProxyBidAsync(PlaceProxyBidRequestDto request)
    {
        var listing = await _listingRepository.GetByIdAsync(request.ListingId)
            ?? throw new InvalidOperationException("Listing not found");



        var user = await _userRepository.GetByIdAsync(request.BidderId);
        if (user == null || user.Status != "Active")
        {
            throw new InvalidOperationException("Bidder not found or inactive");
        }
        if (user.Balance < request.MaxBidAmount)
        {
            throw new InvalidOperationException("Insufficient balance for the bid");
        }

        // Create or update bidder's proxy (for simplicity, we always add a new bid record)
        var proxyBid = new Bid
        {
            BidId = Guid.NewGuid(),
            ListingId = request.ListingId,
            BidderId = request.BidderId,
            MaxBidAmount = request.MaxBidAmount,
            ProxyActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await _bidRepository.AddAsync(proxyBid);

        var highest = await _bidRepository.GetHighestProxyForListingAsync(request.ListingId);
        var second = await _bidRepository.GetSecondHighestProxyForListingAsync(request.ListingId);

        var bidIncrement = listing.BidIncrement ?? 1M;
        var currentPrice = await _listingRepository.GetCurrentPriceAsync(listing.ListingId);
        if (currentPrice <= 0M)
        {
            currentPrice = listing.StartPrice ?? 0M;
        }

        // Determine leading bidder and current price per proxy bidding rules
        Guid leadingBidderId;
        decimal newCurrentPrice;

        if (highest == null)
        {
            leadingBidderId = request.BidderId;
            newCurrentPrice = currentPrice;
        }
        else if (second == null)
        {
            leadingBidderId = highest.BidderId ?? request.BidderId;
            newCurrentPrice = Math.Max(currentPrice, Math.Min(highest.MaxBidAmount ?? 0M, (listing.StartPrice ?? 0M)));
        }
        else
        {
            if ((highest.MaxBidAmount ?? 0M) == (second.MaxBidAmount ?? 0M))
            {
                leadingBidderId = highest.BidderId ?? request.BidderId;
                newCurrentPrice = Math.Max(currentPrice, (highest.MaxBidAmount ?? 0M));
            }
            else
            {
                leadingBidderId = highest.BidderId ?? request.BidderId;
                var target = (second.MaxBidAmount ?? 0M) + bidIncrement;
                newCurrentPrice = Math.Min(highest.MaxBidAmount ?? target, target);
                newCurrentPrice = Math.Max(newCurrentPrice, currentPrice);
            }
        }

        if (newCurrentPrice != currentPrice)
        {
            await _listingRepository.UpdateCurrentPriceAsync(listing.ListingId, newCurrentPrice);
        }

        return new PlaceProxyBidResponseDto
        {
            ListingId = listing.ListingId,
            LeadingBidderId = leadingBidderId,
            CurrentPrice = newCurrentPrice,
            WinningBid = newCurrentPrice,
            YourProxyActive = request.BidderId == leadingBidderId,
            YouAreLeading = request.BidderId == leadingBidderId,
            Outbid = request.BidderId != leadingBidderId
        };
    }
}


