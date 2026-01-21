using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniRent.Backend.DTOs;
using MiniRent.Backend.DTOs.Property;
using MiniRent.Backend.Models;
using MiniRent.Backend.Models.Enums;
using MiniRent.Backend.Services;
using MiniRent.Backend.Services.Interfaces;
using System.Security.Claims;

namespace MiniRent.Backend.Controllers
{
    [ApiController]
    [Route("api/properties")]
    [Authorize]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _service;

        public PropertiesController(IPropertyService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_service.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_service.GetById(id));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Create(PropertyCreateDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User ID claim is missing.");
            }

            var userId = int.Parse(userIdClaim);
            return Ok(await _service.CreateAsync(dto, userId));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _service.SoftDeleteAsync(id));
        }

        // PATCH: api/Properties/4/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            ChangePropertyStatusDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User ID claim is missing.");
            }

            var userId = int.Parse(userIdClaim);

            var result = await _service
                .ChangeStatusAsync(id, dto.Status, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}

    

