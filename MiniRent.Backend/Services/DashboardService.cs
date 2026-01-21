using MiniRent.Backend.Data;
using MiniRent.Backend.DTOs.Dashboard;
using MiniRent.Backend.Models.Enums;
using MiniRent.Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MiniRent.Backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public DashboardDto GetDashboardData()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var totalProperties = _context.Properties.Count(p => !p.IsDeleted);

            var propertiesByStatus = _context.Properties
                .Where(p => !p.IsDeleted)
                .GroupBy(p => p.Status)
                .ToDictionary(g => g.Key.ToString(), g => g.Count());

            var newInquiriesThisMonth = _context.Inquiries
                .Count(i => i.Status == InquiryStatus.New && i.CreatedAt >= startOfMonth);

            var activeRentals = _context.Rentals
                .Count(r => r.IsActive);

            var totalMonthlyRent = _context.Rentals
                .Where(r => r.IsActive)
                .Sum(r => r.MonthlyRent);

            return new DashboardDto
            {
                TotalProperties = totalProperties,
                PropertiesByStatus = propertiesByStatus,
                NewInquiriesThisMonth = newInquiriesThisMonth,
                TotalMonthlyRent = totalMonthlyRent,
                ActiveRentals = activeRentals
            };
        }
    }
}
