import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Inquiry, InquiryCreateRequest, InquiryUpdateRequest, InquiryStatusUpdateRequest, InquiryFilters, InquiryListResponse } from '../../models/inquiry.model';

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  private http = inject(HttpClient);

  getAll(filters?: InquiryFilters): Observable<InquiryListResponse> {
    let params = new HttpParams();
    
    if (filters?.status) {
      params = params.set('status', filters.status.toString());
    }
    if (filters?.propertyId) {
      params = params.set('propertyId', filters.propertyId.toString());
    }
    if (filters?.userId) {
      params = params.set('userId', filters.userId.toString());
    }
    params = params.set('page', (filters?.page || 1).toString());
    params = params.set('pageSize', (filters?.pageSize || 10).toString());

    return this.http.get<InquiryListResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.base}`, { params });
  }
  
  getActiveInquiries(userId?: number): Observable<Inquiry[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId.toString());
    }
    return this.http.get<Inquiry[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.base}/active`, { params });
  }

  getById(id: number): Observable<Inquiry> {
    return this.http.get<Inquiry>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.byId(id)}`);
  }

  create(inquiry: InquiryCreateRequest): Observable<Inquiry> {
    return this.http.post<Inquiry>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.base}`, inquiry);
  }

  update(id: number, inquiry: InquiryUpdateRequest): Observable<Inquiry> {
    return this.http.put<Inquiry>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.byId(id)}`, inquiry);
  }

  updateStatus(id: number, statusUpdate: InquiryStatusUpdateRequest): Observable<any> {
    return this.http.patch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.status(id)}`, statusUpdate);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.inquiries.byId(id)}`);
  }
}
