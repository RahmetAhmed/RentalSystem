using MiniRent.Backend.DTOs;
using MiniRent.Backend.DTOs.Property;
using MiniRent.Backend.Models.Enums;

public interface IPropertyService
{
    IEnumerable<PropertyDto> GetAll();
    PropertyDto GetById(int id);
    Task<PropertyDto> CreateAsync(PropertyCreateDto dto, int userId);
    Task<bool> SoftDeleteAsync(int id);

    Task<bool> ChangeStatusAsync(int id, PropertyStatus status, int updatedByUserId);

}


