import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Rental, RentalCreateRequest, RentalUpdateRequest, RentalEndRequest, RentalFilters } from '../../models/rental.model';

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private http = inject(HttpClient);

  getAll(filters?: RentalFilters): Observable<Rental[]> {
    let params = new HttpParams();
    
    if (filters?.isActive !== undefined) {
      params = params.set('isActive', filters.isActive.toString());
    }
    if (filters?.propertyId) {
      params = params.set('propertyId', filters.propertyId.toString());
    }
    if (filters?.userId) {
      params = params.set('userId', filters.userId.toString());
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<Rental[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.base}`, { params });
  }
  
  getActiveRentals(userId?: number): Observable<Rental[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<Rental[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.base}/active`, { params });
  }
  
  createFromInquiry(inquiryId: number, rental: RentalCreateRequest): Observable<Rental> {
    return this.http.post<Rental>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.base}/from-inquiry/${inquiryId}`, rental);
  }

  getById(id: number): Observable<Rental> {
    return this.http.get<Rental>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.byId(id)}`);
  }

  create(rental: RentalCreateRequest): Observable<Rental> {
    return this.http.post<Rental>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.base}`, rental);
  }

  update(id: number, rental: RentalUpdateRequest): Observable<Rental> {
    return this.http.put<Rental>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.byId(id)}`, rental);
  }

  endRental(id: number, endRequest: RentalEndRequest): Observable<any> {
    return this.http.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rentals.end(id)}`, endRequest);
  }
}
