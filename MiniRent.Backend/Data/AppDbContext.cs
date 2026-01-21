using Microsoft.EntityFrameworkCore;
using MiniRent.Backend.Models;
using BCrypt.Net;

namespace MiniRent.Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        /* =========================
         * PROPERTY MODULE (EXISTING)
         * ========================= */
        public DbSet<Property> Properties { get; set; }
        
        /* =========================
         * RENTAL MODULE
         * ========================= */
        public DbSet<Rental> Rentals { get; set; }
        
        /* =========================
         * INQUIRY MODULE
         * ========================= */
        public DbSet<Inquiry> Inquiries { get; set; }

        /* =========================
         * AUTH & ROLE MODULE (NEW)
         * ========================= */
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        /* =========================
         * MODEL CONFIGURATION
         * ========================= */
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /* ---------- Property ---------- */
            modelBuilder.Entity<Property>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);
          

            modelBuilder.Entity<Property>()
                .Property(p => p.Status)
                .HasConversion<int>();
                
            /* ---------- Rental ---------- */
            modelBuilder.Entity<Rental>()
                .Property(r => r.Deposit)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<Rental>()
                .Property(r => r.MonthlyRent)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Property)
                .WithMany()
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Inquiry)
                .WithMany()
                .HasForeignKey(r => r.InquiryId)
                .OnDelete(DeleteBehavior.SetNull);
        
            /* ---------- Inquiry ---------- */
            modelBuilder.Entity<Inquiry>()
                .Property(i => i.Status)
                .HasConversion<int>();
                
            modelBuilder.Entity<Inquiry>()
                .HasOne(i => i.Property)
                .WithMany()
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.SetNull);
                
            modelBuilder.Entity<Inquiry>()
                .HasOne(i => i.User)
                .WithMany()
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        

        // WHY: Prevents decimal truncation warning
        modelBuilder.Entity<Property>()
             .HasQueryFilter(p => !p.IsDeleted);
        

        /* ---------- UserRole (Many-to-Many) ---------- */
        modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            /* ---------- SEED DEFAULT ROLES ---------- */
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "User" }
            );

            /* ---------- SEED DEFAULT ADMIN USER ---------- */
            var adminPassword = BCrypt.Net.BCrypt.HashPassword("Admin@123"); // secure hashed password

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FullName = "admin",
                    Email = "admin@example.com",
                    PasswordHash = adminPassword
                }
            );

            /* ---------- ASSIGN ADMIN ROLE TO DEFAULT ADMIN ---------- */
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole
                {
                    UserId = 1,
                    RoleId = 1 // Admin role
                }
            );
        }
    }
}
