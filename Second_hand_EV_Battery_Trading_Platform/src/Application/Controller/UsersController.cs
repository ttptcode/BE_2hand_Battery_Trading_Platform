using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserRepository userRepository, ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> GetUser(Guid id)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult($"User with ID {id} not found"));
            }
            
            var userData = new
            {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                status = user.Status,
                createdAt = user.CreatedAt
            };
            
            return Ok(ApiResponse<object>.SuccessResult(userData, "User retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting user {UserId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error occurred while retrieving user", ex.Message));
        }
    }

    /// <summary>
    /// Check if user exists
    /// </summary>
    [HttpHead("{id}")]
    public async Task<ActionResult<ApiResponse>> UserExists(Guid id)
    {
        try
        {
            var exists = await _userRepository.ExistsAsync(id);
            if (exists)
            {
                return Ok(ApiResponse.SuccessResult("User exists"));
            }
            else
            {
                return NotFound(ApiResponse.ErrorResult($"User with ID {id} not found"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking if user {UserId} exists", id);
            return StatusCode(500, ApiResponse.ErrorResult("Internal server error occurred while checking user existence", ex.Message));
        }
    }
}
