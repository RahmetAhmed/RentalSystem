import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);

  uploadImage(file: File): Observable<{ imageId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ imageId: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.images.upload}`, formData);
  }

  getImageUrl(imageId: string): string {
    if (!imageId) return '';
    return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.images.get(imageId)}`;
  }
}
