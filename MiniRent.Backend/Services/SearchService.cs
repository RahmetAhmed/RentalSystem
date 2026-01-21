using MiniRent.Backend.Data;
using MiniRent.Backend.DTOs.Search;
using MiniRent.Backend.Services.Interfaces;

namespace MiniRent.Backend.Services
{
    public class SearchService : ISearchService
    {
        private readonly AppDbContext _context;

        public SearchService(AppDbContext context)
        {
            _context = context;
        }

        public SearchDto Search(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new SearchDto { Query = query };

            var searchTerm = query.ToLower();

            // Search properties by title, location
            var properties = _context.Properties
                .Where(p => !p.IsDeleted && 
                    (p.Title.ToLower().Contains(searchTerm) || 
                     p.Location.ToLower().Contains(searchTerm)))
                .Take(10)
                .Select(p => new SearchResultDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Type = "Property",
                    AdditionalInfo = p.Location
                })
                .ToList();

            // Search inquiries by name, email, phone
            var inquiries = _context.Inquiries
                .Where(i => i.Name.ToLower().Contains(searchTerm) ||
                           i.Email.ToLower().Contains(searchTerm) ||
                           i.Phone.Contains(searchTerm))
                .Take(10)
                .Select(i => new SearchResultDto
                {
                    Id = i.Id,
                    Title = i.Name,
                    Type = "Inquiry",
                    AdditionalInfo = i.Email
                })
                .ToList();

            // Search rentals by tenant name
            var rentalTenants = _context.Rentals
                .Where(r => r.TenantName.ToLower().Contains(searchTerm) ||
                           r.TenantPhone.Contains(searchTerm))
                .Take(10)
                .Select(r => new SearchResultDto
                {
                    Id = r.Id,
                    Title = r.TenantName,
                    Type = "Rental",
                    AdditionalInfo = r.TenantPhone
                })
                .ToList();

            return new SearchDto
            {
                Query = query,
                Properties = properties,
                Inquiries = inquiries
            };
        }
    }
}
