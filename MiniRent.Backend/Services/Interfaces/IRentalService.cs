using MiniRent.Backend.DTOs.Rental;

namespace MiniRent.Backend.Services.Interfaces
{
    public interface IRentalService
    {
        IEnumerable<RentalDto> GetAll(bool? isActive = null, int? propertyId = null, int? userId = null, DateTime? startDate = null, DateTime? endDate = null);
        IEnumerable<RentalDto> GetActiveRentals(int? userId = null);
        RentalDto GetById(int id);
        Task<RentalDto> CreateAsync(RentalCreateDto dto, int userId);
        Task<RentalDto> CreateFromInquiryAsync(int inquiryId, RentalCreateDto dto, int userId);
        Task<RentalDto> UpdateAsync(int id, RentalUpdateDto dto);
        Task<bool> EndRentalAsync(int id, RentalEndDto dto, int userId);
    }
}
