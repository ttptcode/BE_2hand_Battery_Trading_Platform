using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Second_hand_EV_Battery_Trading_Platform.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public IActionResult AdminOnly()
        {
            return Ok("✅ Bạn là Admin!");
        }

        [Authorize(Roles = "User")]
        [HttpGet("user")]
        public IActionResult UserOnly()
        {
            return Ok("✅ Bạn là User!");
        }

        [AllowAnonymous]
        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok("🌍 Ai cũng vào được!");
        }
    }
}
