using MiniRent.Backend.Data;
using MiniRent.Backend.DTOs.Rental;
using MiniRent.Backend.Models;
using MiniRent.Backend.Models.Enums;
using MiniRent.Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using MiniRent.Backend.DTOs.Inquiry;

namespace MiniRent.Backend.Services
{
    public class RentalService : IRentalService
    {
        private readonly AppDbContext _context;
        private readonly IPropertyService _propertyService;
        private readonly IInquiryService _inquiryService;

        public RentalService(AppDbContext context, IPropertyService propertyService, IInquiryService inquiryService)
        {
            _context = context;
            _propertyService = propertyService;
            _inquiryService = inquiryService;
        }

        public IEnumerable<RentalDto> GetAll(bool? isActive = null, int? propertyId = null, int? userId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.Rentals
                .Include(r => r.Property)
                .Include(r => r.Inquiry)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(r => r.IsActive == isActive.Value);

            if (propertyId.HasValue)
                query = query.Where(r => r.PropertyId == propertyId.Value);
                
            if (userId.HasValue)
            {
                // Filter by tenant - find rentals where tenant email matches user email
                var user = _context.Users.Find(userId.Value);
                if (user != null)
                {
                    query = query.Where(r => r.TenantEmail == user.Email || 
                                           (r.Inquiry != null && r.Inquiry.UserId == userId.Value));
                }
            }

            if (startDate.HasValue)
                query = query.Where(r => r.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(r => r.EndDate <= endDate.Value || r.EndDate == null);

            return query.Select(r => new RentalDto
            {
                Id = r.Id,
                PropertyId = r.PropertyId,
                PropertyTitle = r.Property!.Title,
                PropertyLocation = r.Property!.Location,
                TenantName = r.TenantName,
                TenantPhone = r.TenantPhone,
                TenantEmail = r.TenantEmail,
                InquiryId = r.InquiryId,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                Deposit = r.Deposit,
                MonthlyRent = r.MonthlyRent,
                Notes = r.Notes,
                IsActive = r.IsActive,
                CreatedAt = r.CreatedAt
            }).ToList();
        }
        
        public IEnumerable<RentalDto> GetActiveRentals(int? userId = null)
        {
            return GetAll(isActive: true, userId: userId);
        }

        public RentalDto GetById(int id)
        {
            var rental = _context.Rentals
                .Include(r => r.Property)
                .Include(r => r.Inquiry)
                .FirstOrDefault(r => r.Id == id);

            if (rental == null)
                throw new Exception("Rental not found");

            return new RentalDto
            {
                Id = rental.Id,
                PropertyId = rental.PropertyId,
                PropertyTitle = rental.Property!.Title,
                PropertyLocation = rental.Property!.Location,
                TenantName = rental.TenantName,
                TenantPhone = rental.TenantPhone,
                TenantEmail = rental.TenantEmail,
                InquiryId = rental.InquiryId,
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                Deposit = rental.Deposit,
                MonthlyRent = rental.MonthlyRent,
                Notes = rental.Notes,
                IsActive = rental.IsActive,
                CreatedAt = rental.CreatedAt
            };
        }

        public async Task<RentalDto> CreateAsync(RentalCreateDto dto, int userId)
        {
            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null)
                throw new Exception("Property not found");

            var rental = new Rental
            {
                PropertyId = dto.PropertyId,
                InquiryId = dto.InquiryId,
                TenantName = dto.TenantName,
                TenantPhone = dto.TenantPhone,
                TenantEmail = dto.TenantEmail,
                StartDate = dto.StartDate,
                Deposit = dto.Deposit,
                MonthlyRent = dto.MonthlyRent,
                Notes = dto.Notes,
                IsActive = true,
                CreatedByUserId = userId
            };

            _context.Rentals.Add(rental);

            // If linked to inquiry, update inquiry status to Converted
            if (dto.InquiryId.HasValue)
            {
                var inquiry = await _context.Inquiries.FindAsync(dto.InquiryId.Value);
                if (inquiry != null)
                {
                    inquiry.Status = InquiryStatus.Converted;
                    inquiry.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Auto-set property status to Rented
            await _propertyService.ChangeStatusAsync(dto.PropertyId, PropertyStatus.Rented, userId);

            await _context.SaveChangesAsync();

            return GetById(rental.Id);
        }
        
        public async Task<RentalDto> CreateFromInquiryAsync(int inquiryId, RentalCreateDto dto, int userId)
        {
            var inquiry = await _context.Inquiries.FindAsync(inquiryId);
            if (inquiry == null)
                throw new Exception("Inquiry not found");
                
            if (inquiry.Status == InquiryStatus.Converted)
                throw new Exception("Inquiry has already been converted");
                
            // Verify inquiry can be converted (status is New or Contacted)
            if (inquiry.Status != InquiryStatus.New && inquiry.Status != InquiryStatus.Contacted)
                throw new Exception("Only New or Contacted inquiries can be converted");

            // Lock inquiry ID - must match the inquiry
            if (dto.InquiryId != inquiryId)
                throw new Exception("Inquiry ID mismatch");

            // Lock property ID - must match inquiry's property
            if (dto.PropertyId != inquiry.PropertyId)
                throw new Exception("Property ID must match inquiry property");

            // Auto-populate tenant details from inquiry
            dto.TenantName = inquiry.Name;
            dto.TenantPhone = inquiry.Phone;
            dto.TenantEmail = inquiry.Email;
            dto.InquiryId = inquiryId;
            dto.PropertyId = inquiry.PropertyId ?? throw new Exception("Inquiry property is required");

            // Create rental
            var rental = await CreateAsync(dto, userId);

            return rental;
        }

        public async Task<RentalDto> UpdateAsync(int id, RentalUpdateDto dto)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null)
                throw new Exception("Rental not found");

            // Start date cannot be modified once created
            // Note: This is enforced at the DTO level by not including StartDate in RentalUpdateDto

            // Only allow limited field updates (notes, end date for admin)
            // Tenant name and phone updates are restricted - only admin can update
            if (!string.IsNullOrEmpty(dto.TenantName))
                rental.TenantName = dto.TenantName;

            if (!string.IsNullOrEmpty(dto.TenantPhone))
                rental.TenantPhone = dto.TenantPhone;

            if (dto.Deposit.HasValue)
                rental.Deposit = dto.Deposit.Value;

            if (dto.MonthlyRent.HasValue)
                rental.MonthlyRent = dto.MonthlyRent.Value;

            if (dto.Notes != null)
                rental.Notes = dto.Notes;

            rental.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return GetById(rental.Id);
        }

        public async Task<bool> EndRentalAsync(int id, RentalEndDto dto, int userId)
        {
            var rental = await _context.Rentals
                .Include(r => r.Property)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rental == null)
                return false;

            if (rental.EndDate.HasValue)
                throw new Exception("Rental already ended");

            rental.EndDate = dto.EndDate;
            rental.IsActive = false;
            rental.UpdatedAt = DateTime.UtcNow;

            // Revert property to Available
            await _propertyService.ChangeStatusAsync(rental.PropertyId, PropertyStatus.Available, userId);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
