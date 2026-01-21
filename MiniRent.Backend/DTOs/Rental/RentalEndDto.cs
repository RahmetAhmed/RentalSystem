using System.ComponentModel.DataAnnotations;

namespace MiniRent.Backend.DTOs.Rental
{
    public class RentalEndDto
    {
        [Required]
        public DateTime EndDate { get; set; }
    }
}
