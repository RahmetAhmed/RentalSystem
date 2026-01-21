namespace MiniRent.Backend.DTOs.Search
{
    public class SearchDto
    {
        public string Query { get; set; } = string.Empty;
        public List<SearchResultDto> Properties { get; set; } = new();
        public List<SearchResultDto> Inquiries { get; set; } = new();
    }
    
    public class SearchResultDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? AdditionalInfo { get; set; }
    }
}
