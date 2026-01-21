import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';
import { ImageService } from '../../../core/services/image.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './property-create.html',
  styleUrl: './property-create.css'
})
export class PropertyCreateComponent {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private imageService = inject(ImageService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  propertyForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;
  imageId: string | null = null;

  constructor() {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.required]],
      bedrooms: [0, [Validators.required, Validators.min(1)]],
      areaSqm: [0, [Validators.required, Validators.min(1)]],
      floor: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(1)]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Upload image
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.uploadingImage = true;
    this.imageService.uploadImage(file).subscribe({
      next: (response) => {
        this.imageId = response.imageId;
        this.uploadingImage = false;
        this.snackBar.open('Image uploaded successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.uploadingImage = false;
        this.selectedFile = null;
        this.imagePreview = null;
        this.snackBar.open('Failed to upload image. Please try again.', 'Close', { duration: 3000 });
        console.error('Error uploading image:', error);
      }
    });
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageId = null;
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      const formValue = this.propertyForm.value;
      const propertyData = {
        ...formValue,
        imageId: this.imageId || undefined
      };

      this.propertyService.create(propertyData).subscribe({
        next: () => {
          this.snackBar.open('Property created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/properties']);
        },
        error: (error) => {
          this.snackBar.open('Failed to create property. Please try again.', 'Close', { duration: 3000 });
          console.error('Error creating property:', error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/properties']);
  }
}
