using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniRent.Backend.Data;
using MiniRent.Backend.DTOs.Admin;
using Microsoft.Data.SqlClient;
using MiniRent.Backend.Models;

[ApiController]
[Route("api/Admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ToListAsync();

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
            }).ToList();

            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error loading users: {ex.Message}", success = false });
        }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "User not found", success = false });

            // Check if user is admin
            var isAdmin = user.UserRoles.Any(ur => ur.Role.Name == "Admin");
            if (isAdmin)
            {
                // Check if this is the last admin
                var adminCount = await _context.UserRoles
                    .Include(ur => ur.Role)
                    .CountAsync(ur => ur.Role.Name == "Admin");
                
                if (adminCount <= 1)
                    return BadRequest(new { message = "Cannot delete the last admin user", success = false });
            }

            // Delete user roles first
            _context.UserRoles.RemoveRange(user.UserRoles);
            
            // Delete user
            _context.Users.Remove(user);
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully", success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error deleting user: {ex.Message}", success = false });
        }
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, UpdateUserRoleDto dto)
    {
        try
        {
            if (id != dto.UserId)
                return BadRequest(new { message = "User ID mismatch", success = false });

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "User not found", success = false });

            // Verify role exists
            var role = await _context.Roles.FindAsync(dto.RoleId);
            if (role == null)
                return NotFound(new { message = "Role not found", success = false });

            // Check if user is the last admin and trying to change role
            var isAdmin = user.UserRoles.Any(ur => ur.Role.Name == "Admin");
            if (isAdmin && role.Name != "Admin")
            {
                var adminCount = await _context.UserRoles
                    .Include(ur => ur.Role)
                    .CountAsync(ur => ur.Role.Name == "Admin");
                
                if (adminCount <= 1)
                    return BadRequest(new { message = "Cannot change role of the last admin user", success = false });
            }

            // Remove all existing roles
            _context.UserRoles.RemoveRange(user.UserRoles);

            // Add new role
            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = dto.RoleId
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "User role updated successfully", success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error updating user role: {ex.Message}", success = false });
        }
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        var roles = await _context.Roles
            .Select(r => new { Id = r.Id, Name = r.Name })
            .ToListAsync();

        return Ok(roles);
    }

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(AssignRoleDto dto)
    {
        try
        {
            // Check if the role is already assigned
            var existingRole = await _context.UserRoles
                .AsNoTracking()
                .FirstOrDefaultAsync(ur => ur.UserId == dto.UserId && ur.RoleId == dto.RoleId);

            if (existingRole != null)
            {
                return Ok(new { message = "Role already assigned", success = true });
            }

            _context.UserRoles.Add(new()
            {
                UserId = dto.UserId,
                RoleId = dto.RoleId
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Role assigned successfully", success = true });
        }
        catch (DbUpdateException ex)
        {
            // Check for duplicate key violation (PRIMARY KEY constraint)
            var sqlException = ex.InnerException as SqlException ?? 
                             (ex.InnerException?.InnerException as SqlException);
            
            if (sqlException != null && sqlException.Number == 2627)
            {
                // Handle duplicate key violation
                return Ok(new { message = "Role already assigned", success = true });
            }
            
            // If it's a DbUpdateException but not a duplicate key, return error
            return StatusCode(500, new { message = $"Database error: {ex.Message}", success = false });
        }
        catch (Exception ex)
        {
            // Log the exception details for other errors
            return StatusCode(500, new { message = $"Error assigning role: {ex.Message}", success = false });
        }
    }
}
