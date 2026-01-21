# MiniRent Frontend

Angular 21 frontend application for the MiniRent property rental management system.

## Features

- **Authentication**: Login and registration with JWT token support
- **Property Management**: View, create, and manage properties
- **Role-based Access**: Admin and User roles with different permissions
- **Modern UI**: Built with Angular Material for a beautiful, responsive interface

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (installed globally or via npm)

## Installation

1. Navigate to the frontend directory:
```bash
cd MiniRent.Frontend
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## Building for Production

Build the project:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Configuration

The API base URL is configured in `src/app/core/config/api.config.ts`. By default, it points to:
- `http://localhost:5083/api`

Make sure your backend is running on this port or update the configuration accordingly.

## Project Structure

```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── admin/          # Admin panel components
│   │   ├── auth/           # Login and register components
│   │   ├── properties/     # Property management components
│   │   └── navbar/         # Navigation component
│   ├── core/               # Core functionality
│   │   ├── config/         # Configuration files
│   │   ├── guards/         # Route guards
│   │   ├── interceptors/   # HTTP interceptors
│   │   └── services/       # Angular services
│   ├── models/             # TypeScript interfaces and models
│   ├── app.config.ts       # Application configuration
│   ├── app.routes.ts       # Route definitions
│   └── app.ts              # Root component
└── styles.css              # Global styles
```

## Features Overview

### Authentication
- **Login**: Users can log in with email and password
- **Register**: New users can create an account
- **JWT Token Management**: Automatic token handling and storage

### Property Management
- **List Properties**: View all available properties in a grid layout
- **Create Property**: Add new properties (requires authentication)
- **Property Details**: View detailed information about a property
- **Status Management**: Admins can change property status

### Admin Features
- **Role Assignment**: Assign roles to users
- **Property Deletion**: Delete properties
- **Status Updates**: Change property status (Available, Rented, Reserved, Maintenance)

## Technologies Used

- Angular 21
- Angular Material
- RxJS
- TypeScript
- CSS3

## Notes

- The frontend expects the backend API to be running on `http://localhost:5083`
- CORS is configured in the backend to allow requests from `http://localhost:4200`
- JWT tokens are stored in localStorage
- The application uses Angular Material for UI components
