import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'properties',
    loadComponent: () => import('./components/properties/property-list/property-list').then(m => m.PropertyListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'properties/create',
    loadComponent: () => import('./components/properties/property-create/property-create').then(m => m.PropertyCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./components/properties/property-details/property-details').then(m => m.PropertyDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-panel/admin-panel').then(m => m.AdminPanelComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rentals',
    loadComponent: () => import('./components/rentals/rental-list/rental-list').then(m => m.RentalListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rentals/create',
    loadComponent: () => import('./components/rentals/rental-create/rental-create').then(m => m.RentalCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rentals/:id',
    loadComponent: () => import('./components/rentals/rental-details/rental-details').then(m => m.RentalDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inquiries',
    loadComponent: () => import('./components/inquiries/inquiry-list/inquiry-list').then(m => m.InquiryListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inquiries/create',
    loadComponent: () => import('./components/inquiries/inquiry-create/inquiry-create').then(m => m.InquiryCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inquiries/:id',
    loadComponent: () => import('./components/inquiries/inquiry-details/inquiry-details').then(m => m.InquiryDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search/search').then(m => m.SearchComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
