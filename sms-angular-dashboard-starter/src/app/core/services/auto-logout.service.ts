import { Injectable, inject } from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from './auth.service';

export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

@Injectable({ providedIn: 'root' })
export class AutoLogoutService {
  private readonly auth = inject(AuthService);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private started = false;

  start() {
    if (this.started || typeof window === 'undefined') {
      return;
    }

    this.started = true;
    ACTIVITY_EVENTS.forEach(eventName => {
      window.addEventListener(eventName, this.recordActivity, { passive: true });
    });

    this.auth.currentUser$.subscribe(session => {
      if (session?.token) {
        this.resetTimer();
        return;
      }
      this.clearTimer();
    });

    if (this.auth.isLoggedIn()) {
      this.resetTimer();
    }
  }

  private readonly recordActivity = () => {
    this.auth.currentUser$.pipe(take(1)).subscribe(session => {
      if (session?.token) {
        this.resetTimer();
      }
    });
  };

  private resetTimer() {
    this.clearTimer();
    this.timeoutId = window.setTimeout(() => {
      if (this.auth.isLoggedIn()) {
        this.auth.logout();
      }
    }, INACTIVITY_TIMEOUT_MS);
  }

  private clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
