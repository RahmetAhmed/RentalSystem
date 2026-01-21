# MiniRent (Full-Stack) — Property Rental Management System

MiniRent is a full-stack property rental management system:

- **Backend**: ASP.NET Core **.NET 8** Web API (`minirentsystem/MiniRent.Backend`) + **SQL Server** + Entity Framework Core
- **Frontend**: **Angular 21** (`minirentsystem/MiniRent.Frontend`) with Angular Material

The backend exposes a REST API (with Swagger) for authentication, property management, inquiries, rentals, admin role assignment, dashboard stats, and search.

---

## Repository Structure

```
minirentsystem/
  MiniRent.Backend/   # .NET 8 Web API + EF Core migrations
  MiniRent.Frontend/  # Angular 21 UI
```

---

## Prerequisites

- **.NET SDK**: 8.x
- **Node.js**: 18+ (recommended)
- **npm**: 9+ (repo frontend uses npm)
- **SQL Server**: LocalDB or SQL Server (Windows recommended)

---

## Setup (Backend + Database)

### 1) Configure the SQL Server connection string

Update the connection string in:

- `minirentsystem/MiniRent.Backend/appsettings.json`

Example (current format):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=MiniRentDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

### 2) Run the backend API

From the repo root:

```bash
cd minirentsystem/MiniRent.Backend
dotnet restore
dotnet run
```

The API runs on:

- `http://localhost:5083`
- Swagger UI: `http://localhost:5083/swagger`

**Database migrations**: on startup, the backend automatically runs EF Core migrations (`db.Database.Migrate()`), creating/updating the `MiniRentDb` schema.

---

## Setup (Frontend)

From the repo root:

```bash
cd minirentsystem/MiniRent.Frontend
npm install
npm start
```

Frontend runs on:

- `http://localhost:4200`

The frontend is configured to call the backend at:

- `http://localhost:5083/api` (see `src/app/core/config/api.config.ts`)

> Note: Backend CORS is configured to allow `http://localhost:4200`.

---

## Default Seeded Accounts / Roles

On first run (via EF Core seed data), the backend creates:

- Roles:
  - `Admin`
  - `User`
- Default admin user:
  - **Email**: `admin@example.com`
  - **Password**: `Admin@123`

Use this account to access admin endpoints and admin UI actions (role assignment, status updates, etc.).

---

## Database Schema (EF Core)

Below is the schema as defined by the EF Core model and migrations.

### Tables

- **`Users`**
  - `Id` (PK, int)
  - `FullName` (nvarchar(max))
  - `Email` (nvarchar(max))
  - `PasswordHash` (nvarchar(max))
  - `Role` (nvarchar(max)) *(legacy/unused in practice; roles are handled via `UserRoles`)*

- **`Roles`**
  - `Id` (PK, int)
  - `Name` (nvarchar(max)) — seeded: `Admin`, `User`

- **`UserRoles`** *(many-to-many join table)*
  - `UserId` (PK/FK → `Users.Id`)
  - `RoleId` (PK/FK → `Roles.Id`)

- **`Properties`**
  - `Id` (PK, int)
  - `Title` (nvarchar(max))
  - `Location` (nvarchar(max))
  - `Bedrooms` (int)
  - `AreaSqm` (float)
  - `Floor` (int)
  - `Price` (decimal(18,2))
  - `ImageId` (nvarchar(max), nullable)
  - `Status` (int) — enum: `1=Available, 2=Rented, 3=Reserved, 4=Maintenance`
  - `IsDeleted` (bit) *(soft delete; filtered out by default query filter)*
  - `CreatedByUserId` (int, nullable)
  - `UpdatedByUserId` (int, nullable)
  - `CreatedAt` (datetime2)
  - `UpdatedAt` (datetime2, nullable)

- **`Inquiries`**
  - `Id` (PK, int)
  - `PropertyId` (FK → `Properties.Id`, nullable)
  - `UserId` (FK → `Users.Id`, nullable)
  - `Name` (nvarchar(max))
  - `Phone` (nvarchar(max))
  - `Email` (nvarchar(max))
  - `Message` (nvarchar(max))
  - `Status` (int) — enum: `1=New, 2=Contacted, 3=Rejected, 4=Converted`
  - `CreatedAt` (datetime2)
  - `UpdatedAt` (datetime2, nullable)

- **`Rentals`**
  - `Id` (PK, int)
  - `PropertyId` (FK → `Properties.Id`, required)
  - `InquiryId` (FK → `Inquiries.Id`, nullable)
  - `TenantName` (nvarchar(max))
  - `TenantPhone` (nvarchar(max))
  - `TenantEmail` (nvarchar(max), nullable)
  - `StartDate` (datetime2)
  - `EndDate` (datetime2, nullable)
  - `Deposit` (decimal(18,2))
  - `MonthlyRent` (decimal(18,2))
  - `Notes` (nvarchar(max), nullable)
  - `IsActive` (bit)
  - `CreatedByUserId` (int, nullable)
  - `CreatedAt` (datetime2)
  - `UpdatedAt` (datetime2, nullable)

### Relationships

- `Users` ⟷ `Roles` (many-to-many) via `UserRoles`
- `Inquiries.PropertyId` → `Properties.Id` (nullable, **ON DELETE SET NULL**)
- `Inquiries.UserId` → `Users.Id` (nullable, **ON DELETE SET NULL**)
- `Rentals.PropertyId` → `Properties.Id` (required, **ON DELETE RESTRICT**)
- `Rentals.InquiryId` → `Inquiries.Id` (nullable, **ON DELETE SET NULL**)

---

## Demo Steps (What to show in a recording / reviewer walkthrough)

1. **Start the backend**
   - Open Swagger: `http://localhost:5083/swagger`
2. **Start the frontend**
   - Open UI: `http://localhost:4200`
3. **Login as Admin**
   - `admin@example.com` / `Admin@123`
4. **Property Management**
   - Create a property (title, location, bedrooms, price, etc.)
   - Upload/select an image (if supported in the UI)
   - Update property status (Available → Reserved/Rented/Maintenance)
5. **Inquiries**
   - Submit an inquiry for a property
   - Update inquiry status (New → Contacted/Rejected/Converted)
6. **Rentals**
   - Create a rental for a property (optionally linked to an inquiry)
   - End a rental and verify property availability/status updates (if implemented)
7. **Admin**
   - View users
   - Assign/update user roles
8. **Dashboard/Search**
   - View dashboard stats
   - Search/filter properties



