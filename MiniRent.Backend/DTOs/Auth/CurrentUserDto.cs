namespace MiniRent.Backend.DTOs.Auth
{
    public class CurrentUserDto
    {
        public required string Fullname { get; set; }
        public required string Role { get; set; }
    }
}
