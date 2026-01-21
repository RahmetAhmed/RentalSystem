using Microsoft.AspNetCore.Mvc;

namespace MiniRent.Backend.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("MiniRent API is working!");
        }
    }
}
