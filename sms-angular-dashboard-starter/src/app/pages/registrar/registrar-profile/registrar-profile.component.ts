import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registrar-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-profile.component.html',
  styleUrl: './registrar-profile.component.scss',
})
export class RegistrarProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);

  currentUser: any;
  profileName = '';
  message = '';
  error = '';

  ngOnInit() {
    this.auth.currentUser$.subscribe((session) => {
      this.currentUser = session?.user ?? this.readStoredUser();
      this.profileName = this.displayName;
    });
  }

  get displayName(): string {
    return this.currentUser?.name || this.currentUser?.fullName || this.currentUser?.email?.split('@')[0] || 'Registrar User';
  }

  get email(): string {
    return this.currentUser?.email || 'No email available';
  }

  get role(): string {
    return this.currentUser?.role || 'REGISTRAR';
  }

  get avatarUrl(): string {
    return this.currentUser?.avatarUrl || '';
  }

  get initials(): string {
    return this.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'R';
  }

  saveProfileName() {
    this.message = '';
    this.error = '';
    const name = this.profileName.trim();

    if (name.length < 2) {
      this.error = 'Name must contain at least 2 characters.';
      return;
    }

    this.auth.updateCurrentUser({ name: name });
    this.currentUser = { ...this.currentUser, name };
    this.profileName = name;
    this.message = 'Registrar profile name updated.';
  }

  resetName() {
    this.profileName = this.displayName;
    this.message = '';
    this.error = '';
  }

  private readStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }
}
