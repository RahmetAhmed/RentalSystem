using System.ComponentModel.DataAnnotations;

namespace MiniRent.Backend.DTOs.Inquiry
{
    public class InquiryCreateDto
    {
        public int? PropertyId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string Message { get; set; } = string.Empty;
    }
}
