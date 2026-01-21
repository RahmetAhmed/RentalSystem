


using MiniRent.Backend.DTOs.Auth;

namespace MiniRent.Backend.Services.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto dto);
    Task<string> LoginAsync(LoginDto dto);
}
