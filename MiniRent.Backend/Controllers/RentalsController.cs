using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniRent.Backend.DTOs.Rental;
using MiniRent.Backend.Services.Interfaces;
using System.Security.Claims;

namespace MiniRent.Backend.Controllers
{
    [ApiController]
    [Route("api/rentals")]
    [Authorize]
    public class RentalsController : ControllerBase
    {
        private readonly IRentalService _service;

        public RentalsController(IRentalService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] bool? isActive, [FromQuery] int? propertyId, [FromQuery] int? userId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            
            // Non-admin users can only view their own rentals
            if (!isAdmin && !userId.HasValue)
            {
                userId = currentUserId;
            }
            else if (!isAdmin && userId.HasValue && userId.Value != currentUserId)
            {
                return Forbid("You can only view your own rentals");
            }

            return Ok(_service.GetAll(isActive, propertyId, userId, startDate, endDate));
        }
        
        [HttpGet("active")]
        public IActionResult GetActiveRentals([FromQuery] int? userId = null)
        {
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            
            // Non-admin users can only view their own rentals
            if (!isAdmin && !userId.HasValue)
            {
                userId = currentUserId;
            }
            else if (!isAdmin && userId.HasValue && userId.Value != currentUserId)
            {
                return Forbid("You can only view your own rentals");
            }

            return Ok(_service.GetActiveRentals(userId));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var rental = _service.GetById(id);
            
            // Check if user can access this rental
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            
            // Verify user owns this rental or is admin
            // This check will be done via email or inquiry user relationship
            // For now, we allow access but need to verify in service
            
            return Ok(rental);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] RentalCreateDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");

            var userId = int.Parse(userIdClaim);
            return Ok(await _service.CreateAsync(dto, userId));
        }
        
        [HttpPost("from-inquiry/{inquiryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateFromInquiry(int inquiryId, [FromBody] RentalCreateDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");

            var userId = int.Parse(userIdClaim);
            
            try
            {
                return Ok(await _service.CreateFromInquiryAsync(inquiryId, dto, userId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] RentalUpdateDto dto)
        {
            // Only admin can edit rentals
            // Tenants can only view their rentals (read-only)
            return Ok(await _service.UpdateAsync(id, dto));
        }

        [HttpPost("{id}/end")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EndRental(int id, [FromBody] RentalEndDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");

            var userId = int.Parse(userIdClaim);
            var result = await _service.EndRentalAsync(id, dto, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }
        
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(userIdClaim) ? null : int.Parse(userIdClaim);
        }
    }
}
