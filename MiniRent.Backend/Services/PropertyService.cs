using MiniRent.Backend.Data;
using MiniRent.Backend.DTOs.Property;
using MiniRent.Backend.Models;
using MiniRent.Backend.Models.Enums;
using MiniRent.Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using MiniRent.Backend.DTOs;

namespace MiniRent.Backend.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly AppDbContext _context;

        public PropertyService(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 GET ALL
        public IEnumerable<PropertyDto> GetAll()
        {
            return _context.Properties
                .Where(p => !p.IsDeleted)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Location = p.Location,
                    Bedrooms = p.Bedrooms,
                    AreaSqm = (decimal)p.AreaSqm,
                    Floor = p.Floor,
                    Price = p.Price,
                    ImageId = p.ImageId,
                    ImageUrl = !string.IsNullOrEmpty(p.ImageId) ? $"/api/images/{p.ImageId}" : null,
                    Status = p.Status.ToString() // ✅ enum → string
                })
                .ToList();
        }

        // 🔹 GET BY ID
        public PropertyDto GetById(int id)
        {
            var p = _context.Properties.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
            if (p == null) throw new Exception("Property not found");

            return new PropertyDto
            {
                Id = p.Id,
                Title = p.Title,
                Location = p.Location,
                Bedrooms = p.Bedrooms,
                AreaSqm = (decimal)p.AreaSqm,
                Floor = p.Floor,
                Price = p.Price,
                ImageId = p.ImageId,
                ImageUrl = !string.IsNullOrEmpty(p.ImageId) ? $"/api/images/{p.ImageId}" : null,
                Status = p.Status.ToString() // ✅ enum → string
            };
        }

        // 🔹 CREATE
        public async Task<PropertyDto> CreateAsync(PropertyCreateDto dto, int userId)
        {
            if (dto.Price <= 0 || dto.Bedrooms < 1)
                throw new Exception("Invalid property data");

            var property = new Property
            {
                Title = dto.Title,
                Location = dto.Location,
                Bedrooms = dto.Bedrooms,
                AreaSqm = dto.AreaSqm,
                Floor = dto.Floor,
                Price = dto.Price,
                ImageId = dto.ImageId,
                Status = PropertyStatus.Available, // ✅ enum
                CreatedByUserId = userId
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return GetById(property.Id);
        }

        // 🔹 SOFT DELETE
        public async Task<bool> SoftDeleteAsync(int id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null) return false;

            if (property.Status == PropertyStatus.Rented) // ✅ enum compare
                throw new Exception("Cannot delete rented property");

            property.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        // 🔹 CHANGE STATUS
        public async Task<bool> ChangeStatusAsync(
      int id,
      PropertyStatus status,
      int updatedByUserId)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null) return false;

            property.Status = status;
            property.UpdatedAt = DateTime.UtcNow;
            property.UpdatedByUserId = updatedByUserId;

            await _context.SaveChangesAsync();
            return true;
        }





        public Task<bool> ChangeStatusAsync(int id, string status)
        {
            throw new NotImplementedException();
        }
    }
}
