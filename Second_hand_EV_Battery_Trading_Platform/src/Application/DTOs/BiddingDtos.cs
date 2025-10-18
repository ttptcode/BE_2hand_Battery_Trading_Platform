using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;

public class PlaceProxyBidRequestDto
{
    [Required]
    public Guid ListingId { get; set; }

    [Required]
    public Guid BidderId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal MaxBidAmount { get; set; }
}

public class PlaceProxyBidResponseDto
{
    public Guid ListingId { get; set; }
    public Guid LeadingBidderId { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal? WinningBid { get; set; }
    public bool YourProxyActive { get; set; }
    public bool YouAreLeading { get; set; }
    public bool Outbid { get; set; }
}


