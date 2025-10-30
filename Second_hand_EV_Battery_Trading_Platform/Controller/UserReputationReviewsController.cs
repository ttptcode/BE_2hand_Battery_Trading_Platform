using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.Controller
{

    [ApiController]
    [Route("api/[controller]")]
    public class UserReputationReviewsController : ControllerBase
    {
        private readonly IUserReputationReviewService _service;
        private readonly ILogger<UserReputationReviewsController> _logger;

        public UserReputationReviewsController(IUserReputationReviewService service, ILogger<UserReputationReviewsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Tạo review (rating + comment)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> Create([FromBody] CreateReviewDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                    return BadRequest(ApiResponse<ReviewResponseDto>.ErrorResult("Validation failed", errors));
                }

                //// xác thực user từ token (để tránh fake reviewerId)
                //var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                //if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userIdFromToken))
                //    return Unauthorized(ApiResponse<ReviewResponseDto>.ErrorResult("Invalid or missing user ID in token"));

                //if (userIdFromToken != dto.ReviewerId)
                //    return Forbid(); // reviewerId provided doesn't match token

                var created = await _service.CreateReviewAsync(dto);
                return StatusCode(201, ApiResponse<ReviewResponseDto>.SuccessResult(created, "Review created successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<ReviewResponseDto>.ErrorResult("Business logic error", ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, ApiResponse<ReviewResponseDto>.ErrorResult("Internal server error", ex.Message));
            }
        }

        [HttpGet("reviewee/{revieweeId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReviewResponseDto>>>> GetByReviewee(Guid revieweeId)
        {
            try
            {
                var list = await _service.GetReviewsByRevieweeAsync(revieweeId);
                return Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.SuccessResult(list, "Reviews retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews by reviewee {RevieweeId}", revieweeId);
                return StatusCode(500, ApiResponse<IEnumerable<ReviewResponseDto>>.ErrorResult("Internal server error", ex.Message));
            }
        }

        [HttpGet("reviewer/{reviewerId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReviewResponseDto>>>> GetByReviewer(Guid reviewerId)
        {
            try
            {
                var list = await _service.GetReviewsByReviewerAsync(reviewerId);
                return Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.SuccessResult(list, "Reviews retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews by reviewer {ReviewerId}", reviewerId);
                return StatusCode(500, ApiResponse<IEnumerable<ReviewResponseDto>>.ErrorResult("Internal server error", ex.Message));
            }
        }

        [HttpGet("listing/{listingId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReviewResponseDto>>>> GetByListing(Guid listingId)
        {
            try
            {
                var list = await _service.GetReviewsByListingAsync(listingId);
                return Ok(ApiResponse<IEnumerable<ReviewResponseDto>>.SuccessResult(list, "Reviews retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews by listing {ListingId}", listingId);
                return StatusCode(500, ApiResponse<IEnumerable<ReviewResponseDto>>.ErrorResult("Internal server error", ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse>> Delete(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                    return Unauthorized(ApiResponse.ErrorResult("Invalid or missing user ID in token"));

                var deleted = await _service.DeleteReviewAsync(id, userId);
                if (!deleted)
                    return NotFound(ApiResponse.ErrorResult("Review not found"));

                return Ok(ApiResponse.SuccessResult("Review deleted successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.ErrorResult("Business logic error", ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId}", id);
                return StatusCode(500, ApiResponse.ErrorResult("Internal server error", ex.Message));
            }
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateReview(Guid id, [FromBody] UpdateReviewDto dto)
        {
            try
            {
                // Lấy userId từ JWT
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                    ?? User.FindFirst("sub")
                    ?? User.FindFirst(ClaimTypes.Name);

                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
                    return Unauthorized(ApiResponse<object>.ErrorResult("Invalid or missing user token."));

                // Lấy review hiện có
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                    return NotFound(ApiResponse<object>.ErrorResult("Review not found."));

                // Chỉ reviewer gốc mới được update
                if (existing.ReviewerId != currentUserId)
                    return StatusCode(403, ApiResponse<object>.ErrorResult("You can only update your own review."));


                // Gọi service để cập nhật
                var updated = await _service.UpdateReviewAsync(id, dto);
                if (updated == null)
                    return BadRequest(ApiResponse<object>.ErrorResult("Failed to update review."));

                return Ok(ApiResponse<object>.SuccessResult(updated, "Review updated successfully."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating review {ReviewId}", id);
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error while updating review", ex.Message));
            }
        }




        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> GetById(Guid id)
        {
            try
            {
                var r = await _service.GetByIdAsync(id);
                if (r == null) return NotFound(ApiResponse<ReviewResponseDto>.ErrorResult("Review not found"));
                return Ok(ApiResponse<ReviewResponseDto>.SuccessResult(r, "Review retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review {ReviewId}", id);
                return StatusCode(500, ApiResponse<ReviewResponseDto>.ErrorResult("Internal server error", ex.Message));
            }
        }
    }
}