import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RentalService } from '../../../core/services/rental.service';
import { PropertyService } from '../../../core/services/property.service';
import { InquiryService } from '../../../core/services/inquiry.service';
import { Property } from '../../../models/property.model';
import { Inquiry } from '../../../models/inquiry.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-rental-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './rental-create.html',
  styleUrl: './rental-create.css'
})
export class RentalCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rentalService = inject(RentalService);
  private propertyService = inject(PropertyService);
  private inquiryService = inject(InquiryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  rentalForm: FormGroup;
  properties: Property[] = [];
  inquiryId?: number;
  inquiry?: Inquiry;
  loading = false;
  fromInquiry = false;

  constructor() {
    this.rentalForm = this.fb.group({
      propertyId: [null, Validators.required],
      tenantName: ['', [Validators.required, Validators.minLength(3)]],
      tenantPhone: ['', [Validators.required]],
      tenantEmail: [''],
      startDate: [null, Validators.required],
      deposit: [0, [Validators.required, Validators.min(0)]],
      monthlyRent: [0, [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if creating from inquiry
    this.route.queryParams.subscribe(params => {
      if (params['inquiryId']) {
        this.inquiryId = +params['inquiryId'];
        this.fromInquiry = true;
        this.loadInquiry(this.inquiryId);
      } else {
        this.loadProperties();
      }
    });
  }
  
  loadInquiry(id: number): void {
    this.loading = true;
    this.inquiryService.getById(id).subscribe({
      next: (inquiry) => {
        this.inquiry = inquiry;
        if (inquiry.propertyId) {
          // Lock property and pre-populate tenant details
          this.rentalForm.patchValue({
            propertyId: inquiry.propertyId,
            tenantName: inquiry.name,
            tenantPhone: inquiry.phone,
            tenantEmail: inquiry.email
          });
          // Disable property, tenant name, phone, and email fields
          this.rentalForm.get('propertyId')?.disable();
          this.rentalForm.get('tenantName')?.disable();
          this.rentalForm.get('tenantPhone')?.disable();
          this.rentalForm.get('tenantEmail')?.disable();
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load inquiry', 'Close', { duration: 3000 });
        this.router.navigate(['/inquiries']);
        this.loading = false;
      }
    });
  }

  loadProperties(): void {
    this.propertyService.getAll().subscribe({
      next: (properties) => {
        this.properties = properties.filter(p => p.status === 'Available');
      }
    });
  }

  onSubmit(): void {
    if (this.rentalForm.valid) {
      const formValue = this.rentalForm.getRawValue(); // Use getRawValue() to get disabled values too
      const rentalData = {
        ...formValue,
        inquiryId: this.inquiryId,
        startDate: new Date(formValue.startDate).toISOString()
      };

      const createObservable = this.fromInquiry && this.inquiryId
        ? this.rentalService.createFromInquiry(this.inquiryId, rentalData)
        : this.rentalService.create(rentalData);

      createObservable.subscribe({
        next: () => {
          this.snackBar.open('Rental created successfully!', 'Close', { duration: 3000 });
          if (this.fromInquiry) {
            this.router.navigate(['/inquiries', this.inquiryId]);
          } else {
            this.router.navigate(['/rentals']);
          }
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to create rental. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          console.error('Error creating rental:', error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/rentals']);
  }
}
