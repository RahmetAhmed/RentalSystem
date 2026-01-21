import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Property, PropertyCreateRequest, ChangePropertyStatusRequest, PropertyStatus } from '../../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);

  getAll(): Observable<Property[]> {
    return this.http.get<Property[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.properties.base}`);
  }

  getById(id: number): Observable<Property> {
    return this.http.get<Property>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.properties.byId(id)}`);
  }

  create(property: PropertyCreateRequest): Observable<Property> {
    return this.http.post<Property>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.properties.base}`, property);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.properties.byId(id)}`);
  }

  changeStatus(id: number, status: PropertyStatus): Observable<any> {
    return this.http.patch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.properties.status(id)}`, { status });
  }
}
