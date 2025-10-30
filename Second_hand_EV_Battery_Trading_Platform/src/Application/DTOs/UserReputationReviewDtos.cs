using System.ComponentModel.DataAnnotations;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public Guid ReviewerId { get; set; }

        [Required]
        public Guid RevieweeId { get; set; }

        public Guid? ListingId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }
    }
    public class UpdateReviewDto
    {
        public Guid? ListingId { get; set; }
       
        public int? Rating { get; set; }
        public string? Comment { get; set; }
    }
    public class ReviewResponseDto
    {
        public Guid ReputationReviewId { get; set; }
        public Guid ReviewerId { get; set; }
        public string? ReviewerName { get; set; }
        public Guid RevieweeId { get; set; }
        public string? RevieweeName { get; set; }
        public Guid? ListingId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
