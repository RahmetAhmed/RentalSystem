using System.ComponentModel.DataAnnotations;

namespace MiniRent.Backend.DTOs.Inquiry
{
    public class InquiryStatusUpdateDto
    {
        [Required]
        public int Status { get; set; }
    }
}
