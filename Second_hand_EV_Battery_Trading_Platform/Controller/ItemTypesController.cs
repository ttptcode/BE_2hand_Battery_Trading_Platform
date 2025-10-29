using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.Controller;

[ApiController]
[Route("api/[controller]")]
[Produces(MediaTypeNames.Application.Json)]
public class ItemTypesController : ControllerBase
{
    private readonly IItemTypeService _itemTypeService;
    private readonly ILogger<ItemTypesController> _logger;

    public ItemTypesController(IItemTypeService itemTypeService, ILogger<ItemTypesController> logger)
    {
        _itemTypeService = itemTypeService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy tất cả ItemType
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ItemTypeDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<ItemTypeDto>>>> GetAll()
    {
        try
        {
            var itemTypes = await _itemTypeService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<ItemTypeDto>>.SuccessResult(itemTypes, "ItemTypes retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all item types");
            return StatusCode(500, ApiResponse<IEnumerable<ItemTypeDto>>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Lấy ItemType theo ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ItemTypeDto>>> GetById(Guid id)
    {
        try
        {
            var itemType = await _itemTypeService.GetByIdAsync(id);
            if (itemType == null)
                return NotFound(ApiResponse<ItemTypeDto>.ErrorResult($"ItemType with ID {id} not found"));

            return Ok(ApiResponse<ItemTypeDto>.SuccessResult(itemType, "ItemType retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting item type {ItemTypeId}", id);
            return StatusCode(500, ApiResponse<ItemTypeDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Lấy ItemType theo tên
    /// </summary>
    [HttpGet("by-name/{name}")]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<ItemTypeDto>>> GetByName(string name)
    {
        try
        {
            var itemType = await _itemTypeService.GetByNameAsync(name);
            if (itemType == null)
                return NotFound(ApiResponse<ItemTypeDto>.ErrorResult($"ItemType with name '{name}' not found"));

            return Ok(ApiResponse<ItemTypeDto>.SuccessResult(itemType, "ItemType retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting item type by name {Name}", name);
            return StatusCode(500, ApiResponse<ItemTypeDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Tạo ItemType mới (Admin only)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ItemTypeDto>>> Create([FromBody] CreateItemTypeDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<ItemTypeDto>.ErrorResult("Validation failed", errors));
            }

            var created = await _itemTypeService.CreateAsync(dto);
            return StatusCode(201, ApiResponse<ItemTypeDto>.SuccessResult(created, "ItemType created successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<ItemTypeDto>.ErrorResult("Validation error", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ItemTypeDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item type");
            return StatusCode(500, ApiResponse<ItemTypeDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Cập nhật ItemType (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<ItemTypeDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<ItemTypeDto>>> Update(Guid id, [FromBody] UpdateItemTypeDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<ItemTypeDto>.ErrorResult("Validation failed", errors));
            }

            var updated = await _itemTypeService.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(ApiResponse<ItemTypeDto>.ErrorResult($"ItemType with ID {id} not found"));

            return Ok(ApiResponse<ItemTypeDto>.SuccessResult(updated, "ItemType updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<ItemTypeDto>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item type {ItemTypeId}", id);
            return StatusCode(500, ApiResponse<ItemTypeDto>.ErrorResult("Internal server error", ex.Message));
        }
    }

    /// <summary>
    /// Xóa ItemType (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        try
        {
            var deleted = await _itemTypeService.DeleteAsync(id);
            if (!deleted)
                return NotFound(ApiResponse<object>.ErrorResult($"ItemType with ID {id} not found"));

            return Ok(ApiResponse<object>.SuccessResult(null, "ItemType deleted successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResult("Business logic error", ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item type {ItemTypeId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error", ex.Message));
        }
    }
}

