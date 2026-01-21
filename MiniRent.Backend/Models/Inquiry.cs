using MiniRent.Backend.Models.Enums;

namespace MiniRent.Backend.Models
{
    public class Inquiry
    {
        public int Id { get; set; }
        public int? PropertyId { get; set; }
        
        // Contact details
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        // Status
        public InquiryStatus Status { get; set; } = InquiryStatus.New;
        
        // User tracking
        public int? UserId { get; set; }
        
        // Tracking
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation
        public Property? Property { get; set; }
        public User? User { get; set; }
    }
}
