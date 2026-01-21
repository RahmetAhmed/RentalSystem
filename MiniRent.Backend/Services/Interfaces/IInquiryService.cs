using MiniRent.Backend.DTOs.Inquiry;
using MiniRent.Backend.Models.Enums;

namespace MiniRent.Backend.Services.Interfaces
{
    public interface IInquiryService
    {
        IEnumerable<InquiryDto> GetAll(InquiryStatus? status = null, int? propertyId = null, int? userId = null, int page = 1, int pageSize = 10);
        IEnumerable<InquiryDto> GetActiveInquiries(int? userId = null);
        InquiryDto GetById(int id);
        Task<InquiryDto> CreateAsync(InquiryCreateDto dto, int? userId = null);
        Task<InquiryDto> UpdateAsync(int id, InquiryUpdateDto dto);
        Task<bool> UpdateStatusAsync(int id, InquiryStatusUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        int GetTotalCount(InquiryStatus? status = null, int? propertyId = null, int? userId = null);
        bool IsActive(int inquiryId);
    }
}
