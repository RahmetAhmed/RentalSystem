using System.ComponentModel.DataAnnotations;

namespace MiniRent.Backend.DTOs.Rental
{
    public class RentalCreateDto
    {
        [Required]
        public int PropertyId { get; set; }
        
        public int? InquiryId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string TenantName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string TenantPhone { get; set; } = string.Empty;
        
        [EmailAddress]
        [StringLength(100)]
        public string? TenantEmail { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Deposit { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal MonthlyRent { get; set; }
        
        public string? Notes { get; set; }
    }
}
