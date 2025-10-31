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
        [HttpPost("toggle")]
        public async Task<ActionResult<ApiResponse<FavoriteResponseDto>>> ToggleFavorite([FromBody] ToggleFavoriteDto dto)
        {
            try
            {
                var result = await _service.ToggleFavoriteAsync(dto);
                return Ok(ApiResponse<FavoriteResponseDto>.SuccessResult(result, "Favorite toggled"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling favorite");
                return StatusCode(500, ApiResponse<FavoriteResponseDto>.ErrorResult("Internal server error", ex.Message));
            }
        }

    }
}
