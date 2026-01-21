import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { LoginRequest, LoginResponse, RegisterRequest, CurrentUser } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Don't load user in constructor to avoid blocking app initialization
    // User will be loaded when needed or after app is ready
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.loadCurrentUser();
        })
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  loadCurrentUser(): void {
    try {
      this.http.get<CurrentUser>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.me}`)
        .subscribe({
          next: (user) => this.currentUserSubject.next(user),
          error: () => {
            // If token is invalid, clear it
            this.logout();
          }
        });
    } catch (error) {
      console.error('Error loading current user:', error);
      this.logout();
    }
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'Admin';
  }
}
