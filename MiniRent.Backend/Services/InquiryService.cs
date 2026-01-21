using MiniRent.Backend.Data;
using MiniRent.Backend.DTOs.Inquiry;
using MiniRent.Backend.Models;
using MiniRent.Backend.Models.Enums;
using MiniRent.Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniRent.Backend.Services
{
    public class InquiryService : IInquiryService
    {
        private readonly AppDbContext _context;

        public InquiryService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<InquiryDto> GetAll(InquiryStatus? status = null, int? propertyId = null, int? userId = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Inquiries
                .Include(i => i.Property)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(i => i.Status == status.Value);

            if (propertyId.HasValue)
                query = query.Where(i => i.PropertyId == propertyId.Value);
                
            if (userId.HasValue)
                query = query.Where(i => i.UserId == userId.Value);

            var inquiries = query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
                
            // Map to DTOs with rental lookup
            return inquiries.Select(i =>
            {
                var rental = _context.Rentals.FirstOrDefault(r => r.InquiryId == i.Id);
                return new InquiryDto
                {
                    Id = i.Id,
                    PropertyId = i.PropertyId,
                    PropertyTitle = i.Property != null ? i.Property.Title : null,
                    PropertyLocation = i.Property != null ? i.Property.Location : null,
                    Name = i.Name,
                    Phone = i.Phone,
                    Email = i.Email,
                    Message = i.Message,
                    Status = i.Status.ToString(),
                    UserId = i.UserId,
                    RentalId = rental?.Id,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                };
            }).ToList();
        }
        
        public IEnumerable<InquiryDto> GetActiveInquiries(int? userId = null)
        {
            var query = _context.Inquiries
                .Include(i => i.Property)
                .Where(i => i.Status == InquiryStatus.New || i.Status == InquiryStatus.Contacted)
                .AsQueryable();
                
            if (userId.HasValue)
                query = query.Where(i => i.UserId == userId.Value);

            var inquiries = query
                .OrderByDescending(i => i.CreatedAt)
                .ToList();
                
            // Map to DTOs with rental lookup
            return inquiries.Select(i =>
            {
                var rental = _context.Rentals.FirstOrDefault(r => r.InquiryId == i.Id);
                return new InquiryDto
                {
                    Id = i.Id,
                    PropertyId = i.PropertyId,
                    PropertyTitle = i.Property != null ? i.Property.Title : null,
                    PropertyLocation = i.Property != null ? i.Property.Location : null,
                    Name = i.Name,
                    Phone = i.Phone,
                    Email = i.Email,
                    Message = i.Message,
                    Status = i.Status.ToString(),
                    UserId = i.UserId,
                    RentalId = rental?.Id,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                };
            }).ToList();
        }

        public InquiryDto GetById(int id)
        {
            var inquiry = _context.Inquiries
                .Include(i => i.Property)
                .FirstOrDefault(i => i.Id == id);

            if (inquiry == null)
                throw new Exception("Inquiry not found");

            // Find linked rental if exists
            var rental = _context.Rentals.FirstOrDefault(r => r.InquiryId == inquiry.Id);
            
            return new InquiryDto
            {
                Id = inquiry.Id,
                PropertyId = inquiry.PropertyId,
                PropertyTitle = inquiry.Property != null ? inquiry.Property.Title : null,
                PropertyLocation = inquiry.Property != null ? inquiry.Property.Location : null,
                Name = inquiry.Name,
                Phone = inquiry.Phone,
                Email = inquiry.Email,
                Message = inquiry.Message,
                Status = inquiry.Status.ToString(),
                UserId = inquiry.UserId,
                RentalId = rental?.Id,
                CreatedAt = inquiry.CreatedAt,
                UpdatedAt = inquiry.UpdatedAt
            };
        }

        public async Task<InquiryDto> CreateAsync(InquiryCreateDto dto, int? userId = null)
        {
            // Check if property is rented
            if (dto.PropertyId.HasValue)
            {
                var property = await _context.Properties.FindAsync(dto.PropertyId.Value);
                if (property != null && property.Status == PropertyStatus.Rented)
                {
                    throw new Exception("Already rented, try another property");
                }
            }

            var inquiry = new Inquiry
            {
                PropertyId = dto.PropertyId,
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Message = dto.Message,
                Status = InquiryStatus.New, // Auto-set to New
                UserId = userId
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            return GetById(inquiry.Id);
        }

        public async Task<InquiryDto> UpdateAsync(int id, InquiryUpdateDto dto)
        {
            var inquiry = await _context.Inquiries.FindAsync(id);
            if (inquiry == null)
                throw new Exception("Inquiry not found");

            if (!string.IsNullOrEmpty(dto.Name))
                inquiry.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Phone))
                inquiry.Phone = dto.Phone;

            if (!string.IsNullOrEmpty(dto.Email))
                inquiry.Email = dto.Email;

            if (dto.Message != null)
                inquiry.Message = dto.Message;

            inquiry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return GetById(inquiry.Id);
        }

        public async Task<bool> UpdateStatusAsync(int id, InquiryStatusUpdateDto dto)
        {
            var inquiry = await _context.Inquiries.FindAsync(id);
            if (inquiry == null)
                return false;

            inquiry.Status = (InquiryStatus)dto.Status;
            inquiry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var inquiry = await _context.Inquiries.FindAsync(id);
            if (inquiry == null)
                return false;

            _context.Inquiries.Remove(inquiry);
            await _context.SaveChangesAsync();

            return true;
        }

        public int GetTotalCount(InquiryStatus? status = null, int? propertyId = null, int? userId = null)
        {
            var query = _context.Inquiries.AsQueryable();

            if (status.HasValue)
                query = query.Where(i => i.Status == status.Value);

            if (propertyId.HasValue)
                query = query.Where(i => i.PropertyId == propertyId.Value);
                
            if (userId.HasValue)
                query = query.Where(i => i.UserId == userId.Value);

            return query.Count();
        }
        
        public bool IsActive(int inquiryId)
        {
            var inquiry = _context.Inquiries.Find(inquiryId);
            if (inquiry == null)
                return false;
                
            return inquiry.Status == InquiryStatus.New || inquiry.Status == InquiryStatus.Contacted;
        }
    }
}
