import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property, PropertyStatus } from '../../../models/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css'
})
export class PropertyDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);

  property: Property | null = null;
  loading = false;
  selectedStatus: PropertyStatus | null = null;

  statusOptions = [
    { value: PropertyStatus.Available, label: 'Available' },
    { value: PropertyStatus.Rented, label: 'Rented' },
    { value: PropertyStatus.Reserved, label: 'Reserved' },
    { value: PropertyStatus.Maintenance, label: 'Maintenance' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(+id);
    }
  }

  loadProperty(id: number): void {
    this.loading = true;
    this.propertyService.getById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.selectedStatus = this.getStatusEnum(property.status);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.loading = false;
        this.snackBar.open('Property not found', 'Close', { duration: 3000 });
        this.router.navigate(['/properties']);
      }
    });
  }

  deleteProperty(): void {
    if (this.property && confirm('Are you sure you want to delete this property?')) {
      this.propertyService.delete(this.property.id).subscribe({
        next: () => {
          this.snackBar.open('Property deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/properties']);
        },
        error: (error) => {
          this.snackBar.open('Failed to delete property', 'Close', { duration: 3000 });
          console.error('Error deleting property:', error);
        }
      });
    }
  }

  updateStatus(): void {
    if (this.property && this.selectedStatus !== null) {
      this.propertyService.changeStatus(this.property.id, this.selectedStatus).subscribe({
        next: () => {
          this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
          this.loadProperty(this.property!.id);
        },
        error: (error) => {
          this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
          console.error('Error updating status:', error);
        }
      });
    }
  }

  getStatusEnum(status: string): PropertyStatus {
    const statusMap: { [key: string]: PropertyStatus } = {
      'Available': PropertyStatus.Available,
      'Rented': PropertyStatus.Rented,
      'Reserved': PropertyStatus.Reserved,
      'Maintenance': PropertyStatus.Maintenance
    };
    return statusMap[status] || PropertyStatus.Available;
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Available': 'primary',
      'Rented': 'warn',
      'Reserved': 'accent',
      'Maintenance': 'warn'
    };
    return statusMap[status] || 'primary';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    return `http://localhost:5083${imageUrl}`;
  }
}
