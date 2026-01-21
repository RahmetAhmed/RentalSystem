import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/config/api.config';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { User, Role } from '../../../models/user-management.model';

@Component({
  selector: 'app-admin-panel',
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
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  users: User[] = [];
  roles: Role[] = [];
  displayedColumns: string[] = ['id', 'fullName', 'email', 'roles', 'actions'];
  loading = false;
  selectedUser: User | null = null;
  roleForm: FormGroup;

  constructor() {
    this.roleForm = this.fb.group({
      roleId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.http.get<User[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.admin.users}`)
      .subscribe({
        next: (users) => {
          console.log('Users loaded:', users);
          this.users = users || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          const errorMessage = error.error?.message || 'Failed to load users. Please check your connection and try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          this.users = [];
          this.loading = false;
        }
      });
  }

  loadRoles(): void {
    this.http.get<Role[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.admin.roles}`)
      .subscribe({
        next: (roles) => {
          console.log('Roles loaded:', roles);
          this.roles = roles || [];
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          const errorMessage = error.error?.message || 'Failed to load roles.';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        }
      });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.fullName}"? This action cannot be undone.`)) {
      this.http.delete<any>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.admin.userById(user.id)}`)
        .subscribe({
          next: (response) => {
            if (response.success !== false) {
              this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
              this.loadUsers();
            } else {
              this.snackBar.open(response.message || 'Failed to delete user', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Failed to delete user. Please try again.';
            this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
            console.error('Error deleting user:', error);
          }
        });
    }
  }

  changeRole(user: User): void {
    this.selectedUser = user;
    // If user has multiple roles, use the first one; otherwise find matching role
    const currentRoleName = user.roles && user.roles.length > 0 ? user.roles[0] : null;
    const currentRole = currentRoleName ? this.roles.find(r => r.name === currentRoleName) : null;
    this.roleForm.patchValue({
      roleId: currentRole?.id || null
    });
  }

  updateUserRole(): void {
    if (this.roleForm.valid && this.selectedUser) {
      const dto = {
        userId: this.selectedUser.id,
        roleId: this.roleForm.value.roleId
      };

      this.http.put<any>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.admin.updateUserRole(this.selectedUser.id)}`, dto)
        .subscribe({
          next: (response) => {
            if (response.success !== false) {
              this.snackBar.open('User role updated successfully', 'Close', { duration: 3000 });
              this.selectedUser = null;
              this.roleForm.reset();
              this.loadUsers();
            } else {
              this.snackBar.open(response.message || 'Failed to update user role', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            const errorMessage = error.error?.message || 'Failed to update user role. Please try again.';
            this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
            console.error('Error updating user role:', error);
          }
        });
    }
  }

  cancelRoleChange(): void {
    this.selectedUser = null;
    this.roleForm.reset();
  }

  getRoleName(roleId: number): string {
    return this.roles.find(r => r.id === roleId)?.name || '';
  }
}
