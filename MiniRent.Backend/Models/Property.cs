using MiniRent.Backend.Models.Enums;

namespace MiniRent.Backend.Models
{
    public class Property
    {
        public int Id { get; set; }

        // Basic info
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        // Property details
        public int Bedrooms { get; set; }
        public double AreaSqm { get; set; }
        public int Floor { get; set; }

        public decimal Price { get; set; }

        // Image
        public string? ImageId { get; set; }

        // Status management
        public PropertyStatus Status { get; set; } = PropertyStatus.Available;

        // Available | Rented | Reserved | Maintenance

        // Soft delete
        public bool IsDeleted { get; set; } = false;

       
        public int? CreatedByUserId { get; set; }
        public int? UpdatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
