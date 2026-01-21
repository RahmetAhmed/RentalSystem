namespace MiniRent.Backend.DTOs.Property
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Location { get; set; } = "";
        public int Bedrooms { get; set; }
        public decimal AreaSqm { get; set; }
        public int Floor { get; set; }
        public decimal Price { get; set; }
        public string? ImageId { get; set; }
        
        // Computed property for image URL
        public string? ImageUrl { get; set; }

        public string Status { get; set; } = "";
    }
}
