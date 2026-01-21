import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RentalService } from '../../core/services/rental.service';
import { InquiryService } from '../../core/services/inquiry.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { SearchService } from '../../core/services/search.service';
import { Rental } from '../../models/rental.model';
import { Inquiry } from '../../models/inquiry.model';
import { Dashboard } from '../../models/dashboard.model';
import { SearchResponse } from '../../models/search.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private rentalService = inject(RentalService);
  private inquiryService = inject(InquiryService);
  private dashboardService = inject(DashboardService);
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  // For user profile
  allRentals: Rental[] = [];
  allInquiries: Inquiry[] = [];
  
  // For admin dashboard
  dashboard: Dashboard | null = null;
  searchForm!: FormGroup;
  searchResults: SearchResponse | null = null;
  searching = false;
  
  loading = false;
  currentUser: any = null;
  isAdmin = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    
    // Initialize search form for admin
    this.searchForm = this.fb.group({
      query: ['']
    });
    
    // If user not loaded yet, wait for it
    if (!this.currentUser) {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isAdmin = this.authService.isAdmin();
        if (user) {
          this.loadData();
        }
      });
      // Try to load current user
      this.authService.loadCurrentUser();
    } else {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    
    if (this.isAdmin) {
      // Load dashboard data for admin
      this.dashboardService.getDashboard().subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard:', error);
          this.loading = false;
        }
      });
    } else {
      // Load profile data for users
      // Load all rentals (history) for user
      this.rentalService.getAll({ isActive: undefined }).subscribe({
        next: (rentals) => {
          this.allRentals = rentals;
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading rentals:', error);
          this.checkLoadingComplete();
        }
      });

      // Load all inquiries (including converted) for user
      this.inquiryService.getAll({ page: 1, pageSize: 100 }).subscribe({
        next: (response) => {
          // Filter to show only converted inquiries for history
          this.allInquiries = response.data.filter(i => i.status === 'Converted');
          this.checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error loading inquiries:', error);
          this.checkLoadingComplete();
        }
      });
    }
  }

  private loadedCount = 0;
  private totalRequests = 2;

  checkLoadingComplete(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.totalRequests) {
      this.loading = false;
      this.loadedCount = 0;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Available': 'primary',
      'Rented': 'warn',
      'Reserved': 'accent',
      'Maintenance': 'warn',
      'New': 'primary',
      'Contacted': 'accent',
      'Rejected': 'warn',
      'Converted': 'primary'
    };
    return statusMap[status] || 'primary';
  }
  
  onSearch(): void {
    const query = this.searchForm.get('query')?.value;
    if (!query || query.trim() === '') {
      this.searchResults = null;
      return;
    }

    this.searching = true;
    this.searchService.search(query.trim()).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searching = false;
      },
      error: (error) => {
        console.error('Error searching:', error);
        this.searching = false;
      }
    });
  }
  
  navigateToSearchResult(type: string, id: number): void {
    if (type === 'Property') {
      this.router.navigate(['/properties', id]);
    } else if (type === 'Inquiry') {
      this.router.navigate(['/inquiries', id]);
    }
  }
  
  getTypeIcon(type: string): string {
    return type === 'Property' ? 'home' : 'mail';
  }
  
  getStatusEntries(): Array<{key: string, value: number}> {
    if (!this.dashboard) return [];
    return Object.entries(this.dashboard.propertiesByStatus).map(([key, value]) => ({ key, value }));
  }

}
