import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../models/property.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css'
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  router = inject(Router);
  authService = inject(AuthService);

  properties: Property[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading = true;
    this.propertyService.getAll().subscribe({
      next: (properties) => {
        this.properties = properties;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.loading = false;
      }
    });
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
