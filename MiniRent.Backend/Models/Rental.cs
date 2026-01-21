namespace MiniRent.Backend.Models
{
    public class Rental
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        
        // Tenant details
        public string TenantName { get; set; } = string.Empty;
        public string TenantPhone { get; set; } = string.Empty;
        public string? TenantEmail { get; set; }
        
        // Inquiry link
        public int? InquiryId { get; set; }
        
        // Rental details
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Deposit { get; set; }
        public decimal MonthlyRent { get; set; }
        public string? Notes { get; set; }
        
        // Tracking
        public bool IsActive { get; set; } = true;
        public int? CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation
        public Property? Property { get; set; }
        public Inquiry? Inquiry { get; set; }
    }
}
