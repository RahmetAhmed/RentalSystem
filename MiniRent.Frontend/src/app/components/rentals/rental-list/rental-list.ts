import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RentalService } from '../../../core/services/rental.service';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rental, RentalFilters } from '../../../models/rental.model';
import { Property } from '../../../models/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rental-list',
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
    MatChipsModule
  ],
  templateUrl: './rental-list.html',
  styleUrl: './rental-list.css'
})
export class RentalListComponent implements OnInit {
  private rentalService = inject(RentalService);
  private propertyService = inject(PropertyService);
  authService = inject(AuthService);
  router = inject(Router);

  rentals: Rental[] = [];
  properties: Property[] = [];
  loading = false;
  filters: RentalFilters = {};
  showActiveOnly = true;
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadProperties();
    this.loadRentals();
  }

  loadProperties(): void {
    this.propertyService.getAll().subscribe({
      next: (properties) => {
        this.properties = properties;
      }
    });
  }

  loadRentals(): void {
    this.loading = true;
    const filters = { ...this.filters, isActive: this.showActiveOnly };
    
    this.rentalService.getAll(filters).subscribe({
      next: (rentals) => {
        this.rentals = rentals;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rentals:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadRentals();
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
}
