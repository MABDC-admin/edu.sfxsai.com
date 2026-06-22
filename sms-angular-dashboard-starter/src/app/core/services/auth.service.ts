import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        const user = this.normalizeUserStorageUrls(storedUser);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next({ token, user });
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);
          const user = response.user ? {
            ...response.user,
            avatarUrl: this.normalizeStorageUrl(response.user.avatarUrl),
          } : response.user;
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          this.currentUserSubject.next({ token: response.access_token, user });
          const rolePath = user.role.toLowerCase();
          this.router.navigate([`/${rolePath}/dashboard`]);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  updateCurrentUser(patch: any) {
    const current = this.currentUserSubject.value;
    if (!current?.user) return;

    const user = this.normalizeUserStorageUrls({ ...current.user, ...patch });
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next({ ...current, user });
  }

  private normalizeUserStorageUrls(user: any) {
    if (!user) {
      return user;
    }

    return {
      ...user,
      avatarUrl: this.normalizeStorageUrl(user.avatarUrl),
    };
  }

  private normalizeStorageUrl(value?: string | null): string {
    if (!value) {
      return '';
    }

    if (value.startsWith('/storage/')) {
      return value;
    }

    try {
      const url = new URL(value);
      if (url.pathname.startsWith('/storage/')) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      return value;
    }

    return value;
  }

  getUserRole() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr).role?.toUpperCase?.();
      } catch { return null; }
    }
    return null;
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
