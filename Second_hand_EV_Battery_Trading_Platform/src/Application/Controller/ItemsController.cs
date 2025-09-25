using Microsoft.AspNetCore.Mvc;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(IItemService itemService, ILogger<ItemsController> logger)
    {
        _itemService = itemService;
        _logger = logger;
    }

    /// <summary>
    /// Get all items
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ItemResponseDto>>>> GetAllItems()
    {
        try
        {
            var items = await _itemService.GetAllItemsAsync();
            return Ok(ApiResponse<IEnumerable<ItemResponseDto>>.SuccessResult(items, "Items retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all items");
            return StatusCode(500, ApiResponse<IEnumerable<ItemResponseDto>>.ErrorResult("Internal server error occurred while retrieving items", ex.Message));
        }
    }

    /// <summary>
    /// Get item by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ItemResponseDto>>> GetItem(Guid id)
    {
        try
        {
            var item = await _itemService.GetItemByIdAsync(id);
            if (item == null)
            {
                return NotFound(ApiResponse<ItemResponseDto>.ErrorResult($"Item with ID {id} not found"));
            }
            return Ok(ApiResponse<ItemResponseDto>.SuccessResult(item, "Item retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting item {ItemId}", id);
            return StatusCode(500, ApiResponse<ItemResponseDto>.ErrorResult("Internal server error occurred while retrieving item", ex.Message));
        }
    }

    /// <summary>
    /// Get items by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ItemResponseDto>>>> GetItemsByUser(Guid userId)
    {
        try
        {
            var items = await _itemService.GetItemsByUserIdAsync(userId);
            return Ok(ApiResponse<IEnumerable<ItemResponseDto>>.SuccessResult(items, $"Items for user {userId} retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting items for user {UserId}", userId);
            return StatusCode(500, ApiResponse<IEnumerable<ItemResponseDto>>.ErrorResult("Internal server error occurred while retrieving user items", ex.Message));
        }
    }

    /// <summary>
    /// Get items by status
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ItemResponseDto>>>> GetItemsByStatus(string status)
    {
        try
        {
            var items = await _itemService.GetItemsByStatusAsync(status);
            return Ok(ApiResponse<IEnumerable<ItemResponseDto>>.SuccessResult(items, $"Items with status '{status}' retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting items with status {Status}", status);
            return StatusCode(500, ApiResponse<IEnumerable<ItemResponseDto>>.ErrorResult("Internal server error occurred while retrieving items by status", ex.Message));
        }
    }

    /// <summary>
    /// Search items
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ItemResponseDto>>>> SearchItems(
        [FromQuery] string? title,
        [FromQuery] string? brand,
        [FromQuery] string? model,
        [FromQuery] string? itemType)
    {
        try
        {
            var items = await _itemService.SearchItemsAsync(title, brand, model, itemType);
            return Ok(ApiResponse<IEnumerable<ItemResponseDto>>.SuccessResult(items, "Search completed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching items");
            return StatusCode(500, ApiResponse<IEnumerable<ItemResponseDto>>.ErrorResult("Internal server error occurred while searching items", ex.Message));
        }
    }

    /// <summary>
    /// Create new item
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ItemResponseDto>>> CreateItem(CreateItemDto createItemDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<ItemResponseDto>.ErrorResult("Validation failed", errors));
            }

            var item = await _itemService.CreateItemAsync(createItemDto);
            return CreatedAtAction(nameof(GetItem), new { id = item.ItemId }, 
                ApiResponse<ItemResponseDto>.SuccessResult(item, "Item created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ItemResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating item");
            return StatusCode(500, ApiResponse<ItemResponseDto>.ErrorResult("Internal server error occurred while creating item", ex.Message));
        }
    }

    /// <summary>
    /// Update item
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ItemResponseDto>>> UpdateItem(Guid id, UpdateItemDto updateItemDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<ItemResponseDto>.ErrorResult("Validation failed", errors));
            }

            var item = await _itemService.UpdateItemAsync(id, updateItemDto);
            if (item == null)
            {
                return NotFound(ApiResponse<ItemResponseDto>.ErrorResult($"Item with ID {id} not found"));
            }

            return Ok(ApiResponse<ItemResponseDto>.SuccessResult(item, "Item updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ItemResponseDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating item {ItemId}", id);
            return StatusCode(500, ApiResponse<ItemResponseDto>.ErrorResult("Internal server error occurred while updating item", ex.Message));
        }
    }

    /// <summary>
    /// Delete item
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteItem(Guid id)
    {
        try
        {
            var result = await _itemService.DeleteItemAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResult($"Item with ID {id} not found"));
            }

            return Ok(ApiResponse.SuccessResult("Item deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting item {ItemId}", id);
            return StatusCode(500, ApiResponse.ErrorResult("Internal server error occurred while deleting item", ex.Message));
        }
    }

    /// <summary>
    /// Check if item exists
    /// </summary>
    [HttpHead("{id}")]
    public async Task<ActionResult<ApiResponse>> ItemExists(Guid id)
    {
        try
        {
            var exists = await _itemService.ItemExistsAsync(id);
            if (exists)
            {
                return Ok(ApiResponse.SuccessResult("Item exists"));
            }
            else
            {
                return NotFound(ApiResponse.ErrorResult($"Item with ID {id} not found"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking if item {ItemId} exists", id);
            return StatusCode(500, ApiResponse.ErrorResult("Internal server error occurred while checking item existence", ex.Message));
        }
    }
}
