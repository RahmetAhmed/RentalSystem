import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rental, RentalEndRequest } from '../../../models/rental.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-rental-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './rental-details.html',
  styleUrl: './rental-details.css'
})
export class RentalDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rentalService = inject(RentalService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  authService = inject(AuthService);

  rental: Rental | null = null;
  loading = false;
  endDate: string = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRental(+id);
    }
  }

  loadRental(id: number): void {
    this.loading = true;
    this.rentalService.getById(id).subscribe({
      next: (rental) => {
        this.rental = rental;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rental:', error);
        this.loading = false;
        this.snackBar.open('Rental not found', 'Close', { duration: 3000 });
        this.router.navigate(['/rentals']);
      }
    });
  }

  endRental(): void {
    if (!this.rental || !this.endDate) return;

    if (!confirm('Are you sure you want to end this rental? The property will be set to Available.')) {
      return;
    }

    const endRequest: RentalEndRequest = {
      endDate: new Date(this.endDate).toISOString()
    };

    this.rentalService.endRental(this.rental.id, endRequest).subscribe({
      next: () => {
        this.snackBar.open('Rental ended successfully', 'Close', { duration: 3000 });
        this.loadRental(this.rental!.id);
      },
      error: (error) => {
        this.snackBar.open('Failed to end rental', 'Close', { duration: 3000 });
        console.error('Error ending rental:', error);
      }
    });
  }

  calculateTotalPaid(): number {
    if (!this.rental) return 0;
    const start = new Date(this.rental.startDate);
    const end = this.rental.endDate ? new Date(this.rental.endDate) : new Date();
    const months = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return months * this.rental.monthlyRent;
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
