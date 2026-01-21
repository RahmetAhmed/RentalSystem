using System.ComponentModel.DataAnnotations;

namespace MiniRent.Backend.DTOs.Rental
{
    public class RentalUpdateDto
    {
        [StringLength(100)]
        public string? TenantName { get; set; }
        
        [StringLength(20)]
        public string? TenantPhone { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? Deposit { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? MonthlyRent { get; set; }
        
        public string? Notes { get; set; }
    }
}
