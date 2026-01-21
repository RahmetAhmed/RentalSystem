using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniRent.Backend.DTOs.Inquiry;
using MiniRent.Backend.Models.Enums;
using MiniRent.Backend.Services.Interfaces;
using System.Security.Claims;

namespace MiniRent.Backend.Controllers
{
    [ApiController]
    [Route("api/inquiries")]
    [Authorize]
    public class InquiriesController : ControllerBase
    {
        private readonly IInquiryService _service;

        public InquiriesController(IInquiryService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] int? status, [FromQuery] int? propertyId, [FromQuery] int? userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // If userId not provided and user is not admin, filter by current user
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            
            int? filterUserId = userId;
            if (!isAdmin && !userId.HasValue)
            {
                filterUserId = currentUserId;
            }
            else if (!isAdmin && userId.HasValue && userId.Value != currentUserId)
            {
                return Forbid("You can only view your own inquiries");
            }

            InquiryStatus? inquiryStatus = status.HasValue ? (InquiryStatus?)status.Value : null;
            var inquiries = _service.GetAll(inquiryStatus, propertyId, filterUserId, page, pageSize);
            var totalCount = _service.GetTotalCount(inquiryStatus, propertyId, filterUserId);
            
            return Ok(new
            {
                data = inquiries,
                page = page,
                pageSize = pageSize,
                totalCount = totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        
        [HttpGet("active")]
        public IActionResult GetActiveInquiries([FromQuery] int? userId = null)
        {
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            
            int? filterUserId = userId;
            if (!isAdmin && !userId.HasValue)
            {
                filterUserId = currentUserId;
            }
            else if (!isAdmin && userId.HasValue && userId.Value != currentUserId)
            {
                return Forbid("You can only view your own inquiries");
            }

            var inquiries = _service.GetActiveInquiries(filterUserId);
            return Ok(inquiries);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var inquiry = _service.GetById(id);
            
            // Check if user can access this inquiry
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            
            // TODO: Add UserId to InquiryDto to check ownership
            // For now, we'll allow access but need to verify in service
            
            return Ok(inquiry);
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> Create([FromBody] InquiryCreateDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var inquiry = await _service.CreateAsync(dto, userId);
                return Ok(new { message = "Inquiry created successfully", data = inquiry, success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, success = false });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int id, [FromBody] InquiryUpdateDto dto)
        {
            // Only admin can update inquiries after conversion
            var inquiry = _service.GetById(id);
            if (inquiry.Status == "Converted" && !User.IsInRole("Admin"))
            {
                return Forbid("Converted inquiries are read-only");
            }
            
            return Ok(await _service.UpdateAsync(id, dto));
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] InquiryStatusUpdateDto dto)
        {
            var inquiry = _service.GetById(id);
            if (inquiry.Status == "Converted")
            {
                return BadRequest("Cannot update status of converted inquiry");
            }
            
            var result = await _service.UpdateStatusAsync(id, dto);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            
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
