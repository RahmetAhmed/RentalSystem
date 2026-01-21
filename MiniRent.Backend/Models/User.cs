namespace MiniRent.Backend.Models;

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = "";

    public string Email { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    // User OR Employee
    public string Role { get; set; } = "";

    // Navigation: one user → many roles
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
