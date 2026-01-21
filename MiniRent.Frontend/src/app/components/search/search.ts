import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';
import { SearchResult } from '../../models/search.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent implements OnInit {
  private searchService = inject(SearchService);
  private fb = inject(FormBuilder);
  router = inject(Router);

  searchForm: FormGroup;
  properties: SearchResult[] = [];
  inquiries: SearchResult[] = [];
  loading = false;
  searched = false;

  constructor() {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
  }

  onSearch(): void {
    const query = this.searchForm.get('query')?.value;
    if (!query || query.trim() === '') return;

    this.loading = true;
    this.searched = true;
    this.searchService.search(query.trim()).subscribe({
      next: (results) => {
        this.properties = results.properties;
        this.inquiries = results.inquiries;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching:', error);
        this.loading = false;
      }
    });
  }

  navigateToResult(result: SearchResult): void {
    if (result.type === 'Property') {
      this.router.navigate(['/properties', result.id]);
    } else if (result.type === 'Inquiry') {
      this.router.navigate(['/inquiries', result.id]);
    }
  }

  getTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Property': 'home',
      'Inquiry': 'mail',
      'Rental': 'receipt_long'
    };
    return iconMap[type] || 'info';
  }
}
