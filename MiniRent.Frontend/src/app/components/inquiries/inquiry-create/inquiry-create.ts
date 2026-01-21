import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InquiryService } from '../../../core/services/inquiry.service';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../models/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inquiry-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './inquiry-create.html',
  styleUrl: './inquiry-create.css'
})
export class InquiryCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inquiryService = inject(InquiryService);
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  inquiryForm: FormGroup;
  properties: Property[] = [];

  constructor() {
    this.inquiryForm = this.fb.group({
      propertyId: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProperties();
    
    // Auto-fill name and email from logged-in user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.inquiryForm.patchValue({
        name: currentUser.fullName,
        email: currentUser.email || ''
      });
      
      // If user not loaded yet, wait for it
      if (!currentUser.email) {
        this.authService.currentUser$.subscribe(user => {
          if (user && user.email) {
            this.inquiryForm.patchValue({
              name: user.fullName,
              email: user.email
            });
          }
        });
        // Try to load current user to get email
        this.authService.loadCurrentUser();
      }
    } else {
      // Load user if not already loaded
      this.authService.loadCurrentUser();
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.inquiryForm.patchValue({
            name: user.fullName,
            email: user.email || ''
          });
        }
      });
    }
    
    const propertyId = this.route.snapshot.queryParamMap.get('propertyId');
    if (propertyId) {
      this.inquiryForm.patchValue({ propertyId: +propertyId });
    }
  }

  loadProperties(): void {
    this.propertyService.getAll().subscribe({
      next: (properties) => {
        // Filter out rented properties - only show Available properties
        this.properties = properties.filter(p => p.status === 'Available');
      }
    });
  }
  
  getAvailableProperties(): Property[] {
    return this.properties.filter(p => p.status === 'Available');
  }

  onSubmit(): void {
    if (this.inquiryForm.valid) {
      const formValue = this.inquiryForm.value;
      
      // Check if property is rented
      if (formValue.propertyId) {
        const selectedProperty = this.properties.find(p => p.id === formValue.propertyId);
        if (selectedProperty && selectedProperty.status === 'Rented') {
          this.snackBar.open('Already rented, try another property', 'Close', { duration: 3000 });
          return;
        }
      }
      
      const inquiryData = {
        ...formValue,
        propertyId: formValue.propertyId || undefined
      };

      this.inquiryService.create(inquiryData).subscribe({
        next: (response: any) => {
          const message = response?.message || 'Inquiry created successfully!';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/inquiries']);
        },
        error: (error) => {
          // Check if it's actually a success (200 response treated as error due to non-JSON response)
          if (error.status === 200 || error.status === 0) {
            this.snackBar.open('Inquiry created successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/inquiries']);
          } else {
            const errorMessage = error.error?.message || error.error?.error || error.error || 'Failed to create inquiry. Please try again.';
            if (errorMessage.toLowerCase().includes('rented')) {
              this.snackBar.open('Already rented, try another property', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
            }
            console.error('Error creating inquiry:', error);
          }
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/inquiries']);
  }
}
