namespace MiniRent.Backend.DTOs.Dashboard
{
    public class DashboardDto
    {
        public int TotalProperties { get; set; }
        public Dictionary<string, int> PropertiesByStatus { get; set; } = new();
        public int NewInquiriesThisMonth { get; set; }
        public decimal TotalMonthlyRent { get; set; }
        public int ActiveRentals { get; set; }
    }
}
