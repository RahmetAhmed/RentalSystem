using MiniRent.Backend.Models.Enums;

namespace MiniRent.Backend.DTOs.Inquiry
{
    public class InquiryDto
    {
        public int Id { get; set; }
        public int? PropertyId { get; set; }
        public string? PropertyTitle { get; set; }
        public string? PropertyLocation { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public int? RentalId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
