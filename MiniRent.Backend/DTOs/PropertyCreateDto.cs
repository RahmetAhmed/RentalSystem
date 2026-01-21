
namespace MiniRent.Backend.DTOs
{
    public class PropertyCreateDto
    {
        
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int Bedrooms { get; set; }
        public double AreaSqm { get; set; }
        public int Floor { get; set; }
        public decimal Price { get; set; }
        public string? ImageId { get; set; }
    }
}


