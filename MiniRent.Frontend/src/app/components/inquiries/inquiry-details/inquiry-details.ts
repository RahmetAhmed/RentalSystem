import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InquiryService } from '../../../core/services/inquiry.service';
import { AuthService } from '../../../core/services/auth.service';
import { Inquiry, InquiryStatusUpdateRequest, InquiryStatus } from '../../../models/inquiry.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-inquiry-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './inquiry-details.html',
  styleUrl: './inquiry-details.css'
})
export class InquiryDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inquiryService = inject(InquiryService);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);

  inquiry: Inquiry | null = null;
  loading = false;
  selectedStatus: InquiryStatus | null = null;

  statusOptions = [
    { value: InquiryStatus.New, label: 'New' },
    { value: InquiryStatus.Contacted, label: 'Contacted' },
    { value: InquiryStatus.Rejected, label: 'Rejected' },
    { value: InquiryStatus.Converted, label: 'Converted' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInquiry(+id);
    }
  }

  loadInquiry(id: number): void {
    this.loading = true;
    this.inquiryService.getById(id).subscribe({
      next: (inquiry) => {
        this.inquiry = inquiry;
        this.selectedStatus = this.getStatusEnum(inquiry.status);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inquiry:', error);
        this.loading = false;
        this.snackBar.open('Inquiry not found', 'Close', { duration: 3000 });
        this.router.navigate(['/inquiries']);
      }
    });
  }

  updateStatus(): void {
    if (!this.inquiry || this.selectedStatus === null || this.isReadOnly()) return;
    
    // Only admin can update status
    if (!this.authService.isAdmin()) {
      this.snackBar.open('Only admins can update inquiry status', 'Close', { duration: 3000 });
      return;
    }

    const statusUpdate: InquiryStatusUpdateRequest = {
      status: this.selectedStatus
    };

    this.inquiryService.updateStatus(this.inquiry.id, statusUpdate).subscribe({
      next: () => {
        this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
        this.loadInquiry(this.inquiry!.id);
      },
      error: (error) => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
        console.error('Error updating status:', error);
      }
    });
  }

  deleteInquiry(): void {
    if (!this.inquiry || !confirm('Are you sure you want to delete this inquiry?')) return;

    this.inquiryService.delete(this.inquiry.id).subscribe({
      next: () => {
        this.snackBar.open('Inquiry deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/inquiries']);
      },
      error: (error) => {
        this.snackBar.open('Failed to delete inquiry', 'Close', { duration: 3000 });
        console.error('Error deleting inquiry:', error);
      }
    });
  }

  getStatusEnum(status: string): InquiryStatus {
    const statusMap: { [key: string]: InquiryStatus } = {
      'New': InquiryStatus.New,
      'Contacted': InquiryStatus.Contacted,
      'Rejected': InquiryStatus.Rejected,
      'Converted': InquiryStatus.Converted
    };
    return statusMap[status] || InquiryStatus.New;
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
  
  canConvert(): boolean {
    return this.authService.isAdmin() && 
           this.inquiry !== null && 
           (this.inquiry.status === 'New' || this.inquiry.status === 'Contacted');
  }
  
  convertToRental(): void {
    if (this.inquiry) {
      // Navigate to rental create with inquiry preselected
      this.router.navigate(['/rentals/create'], { 
        queryParams: { inquiryId: this.inquiry.id } 
      });
    }
  }
  
  isReadOnly(): boolean {
    return this.inquiry?.status === 'Converted';
  }
}
