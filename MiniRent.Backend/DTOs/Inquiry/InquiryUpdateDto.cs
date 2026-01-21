using System.ComponentModel.DataAnnotations;

namespace MiniRent.Backend.DTOs.Inquiry
{
    public class InquiryUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }
        
        [StringLength(20)]
        public string? Phone { get; set; }
        
        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }
        
        [StringLength(1000)]
        public string? Message { get; set; }
    }
}
