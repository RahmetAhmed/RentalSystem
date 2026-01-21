import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InquiryService } from '../../../core/services/inquiry.service';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Inquiry, InquiryFilters, InquiryStatus } from '../../../models/inquiry.model';
import { Property } from '../../../models/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './inquiry-list.html',
  styleUrl: './inquiry-list.css'
})
export class InquiryListComponent implements OnInit {
  private inquiryService = inject(InquiryService);
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  router = inject(Router);

  inquiries: Inquiry[] = [];
  properties: Property[] = [];
  loading = false;
  filters: InquiryFilters = { page: 1, pageSize: 10 };
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20, 50];
  statusOptions = [
    { value: undefined, label: 'All Statuses' },
    { value: InquiryStatus.New, label: 'New' },
    { value: InquiryStatus.Contacted, label: 'Contacted' },
    { value: InquiryStatus.Rejected, label: 'Rejected' },
    { value: InquiryStatus.Converted, label: 'Converted' }
  ];
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadProperties();
    this.loadInquiries();
  }

  loadProperties(): void {
    this.propertyService.getAll().subscribe({
      next: (properties) => {
        this.properties = properties;
      }
    });
  }

  loadInquiries(): void {
    this.loading = true;
    
    // For non-admin users, filter to show only active inquiries (New or Contacted)
    // Exclude converted inquiries from the list for users
    const filters = { ...this.filters };
    if (!this.isAdmin && !filters.status) {
      // For users, we'll filter out converted inquiries on the frontend
      // Or we can use the active inquiries endpoint
      this.inquiryService.getActiveInquiries().subscribe({
        next: (inquiries) => {
          this.inquiries = inquiries;
          this.totalCount = inquiries.length;
          this.totalPages = Math.ceil(inquiries.length / (filters.pageSize || 10));
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading active inquiries:', error);
          this.loading = false;
        }
      });
      return;
    }
    
    this.inquiryService.getAll(filters).subscribe({
      next: (response) => {
        // Filter out converted inquiries for users
        if (!this.isAdmin) {
          this.inquiries = response.data.filter(i => i.status !== 'Converted');
          this.totalCount = response.totalCount - response.data.filter(i => i.status === 'Converted').length;
        } else {
          this.inquiries = response.data;
          this.totalCount = response.totalCount;
        }
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inquiries:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadInquiries();
  }

  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.pageSize = event.pageSize;
    this.loadInquiries();
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'New': 'primary',
      'Contacted': 'accent',
      'Rejected': 'warn',
      'Converted': 'primary'
    };
    return statusMap[status] || 'primary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
