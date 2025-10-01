using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Controller;

[ApiController]
[Route("api/[controller]")]
[Produces(MediaTypeNames.Application.Json)]
public class FeeCommissionsController : ControllerBase
{
    private readonly IFeeCommissionService _service;
    private readonly ILogger<FeeCommissionsController> _logger;

    public FeeCommissionsController(IFeeCommissionService service, ILogger<FeeCommissionsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<FeeCommissionResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IEnumerable<FeeCommissionResponseDto>>>> GetAll()
    {
        var data = await _service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<FeeCommissionResponseDto>>.SuccessResult(data, "Fees retrieved"));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FeeCommissionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FeeCommissionResponseDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<FeeCommissionResponseDto>>> Get(Guid id)
    {
        var fee = await _service.GetByIdAsync(id);
        return fee == null
            ? NotFound(ApiResponse<FeeCommissionResponseDto>.ErrorResult("Fee not found"))
            : Ok(ApiResponse<FeeCommissionResponseDto>.SuccessResult(fee, "Fee retrieved"));
    }

    [HttpPost]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(typeof(ApiResponse<FeeCommissionResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<FeeCommissionResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<FeeCommissionResponseDto>>> Create([FromBody] CreateFeeCommissionDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<FeeCommissionResponseDto>.ErrorResult("Validation failed", errors));
            }

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.FeeId },
                ApiResponse<FeeCommissionResponseDto>.SuccessResult(created, "Fee created"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create fee error");
            return StatusCode(500, ApiResponse<FeeCommissionResponseDto>.ErrorResult("Internal error", ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    [Consumes(MediaTypeNames.Application.Json)]
    [ProducesResponseType(typeof(ApiResponse<FeeCommissionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FeeCommissionResponseDto>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<FeeCommissionResponseDto>>> Update(Guid id, [FromBody] UpdateFeeCommissionDto dto)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated == null
                ? NotFound(ApiResponse<FeeCommissionResponseDto>.ErrorResult("Fee not found"))
                : Ok(ApiResponse<FeeCommissionResponseDto>.SuccessResult(updated, "Fee updated"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update fee error");
            return StatusCode(500, ApiResponse<FeeCommissionResponseDto>.ErrorResult("Internal error", ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var ok = await _service.DeleteAsync(id);
        return ok ? Ok(ApiResponse.SuccessResult("Fee deleted"))
                  : NotFound(ApiResponse.ErrorResult("Fee not found"));
    }
}
