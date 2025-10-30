using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _service;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(IFavoriteService service, ILogger<FavoritesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse<FavoriteResponseDto>>> Create([FromBody] CreateFavoriteDto dto)
        {
            try
            {
                var created = await _service.CreateFavoriteAsync(dto);
                return StatusCode(201, ApiResponse<FavoriteResponseDto>.SuccessResult(created, "Favorite added"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite");
                return StatusCode(500, ApiResponse<FavoriteResponseDto>.ErrorResult("Internal server error", ex.Message));
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FavoriteResponseDto>>>> GetByUser(Guid userId)
        {
            try
            {
                var list = await _service.GetFavoritesByUserAsync(userId);
                return Ok(ApiResponse<IEnumerable<FavoriteResponseDto>>.SuccessResult(list, "Favorites retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorites for user {UserId}", userId);
                return StatusCode(500, ApiResponse<IEnumerable<FavoriteResponseDto>>.ErrorResult("Internal server error", ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "User")]
        public async Task<ActionResult<ApiResponse>> Delete(Guid id)
        {
            try
            {
                var deleted = await _service.DeleteFavoriteAsync(id);
                if (!deleted)
                    return NotFound(ApiResponse.ErrorResult("Favorite not found"));

                return Ok(ApiResponse.SuccessResult("Favorite removed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting favorite {FavoriteId}", id);
                return StatusCode(500, ApiResponse.ErrorResult("Internal server error", ex.Message));
            }
        }
    }
}
