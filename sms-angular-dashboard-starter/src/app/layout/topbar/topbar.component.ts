import { Component, DestroyRef, Injector, inject, signal, OnInit, HostListener, computed } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RegistrarApiService } from '../../core/services/registrar-api.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FinanceNotificationService } from '../../core/services/finance-notification.service';
import { GlobalSearchService } from '../../core/services/global-search.service';
import { FloatingChatService } from '../../core/services/floating-chat.service';
import { TeacherPortalService } from '../../pages/teacher/teacher-portal.service';
import { StudentPortalService } from '../../pages/student/student-portal.service';
import { buildTopbarNotifications, dismissTopbarNotification } from './topbar-notifications.util';
import type { TopbarNotification } from './topbar-notifications.util';

interface PortalTheme {
  id: string;
  label: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  primaryDark: string;
  secondaryDark: string;
  soft: string;
  border: string;
  ring: string;
}

const PORTAL_THEMES: PortalTheme[] = [
  {
    id: 'emerald-blue',
    label: 'Emerald Blue',
    description: 'Fresh school green with bright academic blue.',
    primary: '#059669',
    secondary: '#2563eb',
    accent: '#f59e0b',
    primaryDark: '#047857',
    secondaryDark: '#1d4ed8',
    soft: '#ecfdf5',
    border: '#a7f3d0',
    ring: 'rgba(5, 150, 105, 0.18)',
  },
  {
    id: 'violet-indigo',
    label: 'Violet Indigo',
    description: 'The original deep purple portal theme.',
    primary: '#7c3aed',
    secondary: '#4f46e5',
    accent: '#06b6d4',
    primaryDark: '#5b21b6',
    secondaryDark: '#3730a3',
    soft: '#f5f3ff',
    border: '#ddd6fe',
    ring: 'rgba(124, 58, 237, 0.18)',
  },
  {
    id: 'teal-gold',
    label: 'Teal Gold',
    description: 'Formal teal with warm gold action accents.',
    primary: '#0f766e',
    secondary: '#d97706',
    accent: '#fbbf24',
    primaryDark: '#115e59',
    secondaryDark: '#92400e',
    soft: '#f0fdfa',
    border: '#99f6e4',
    ring: 'rgba(15, 118, 110, 0.18)',
  },
  {
    id: 'rose-sky',
    label: 'Rose Sky',
    description: 'Soft rose paired with clean sky blue.',
    primary: '#e11d48',
    secondary: '#0284c7',
    accent: '#f97316',
    primaryDark: '#be123c',
    secondaryDark: '#0369a1',
    soft: '#fff1f2',
    border: '#fecdd3',
    ring: 'rgba(225, 29, 72, 0.16)',
  },
  {
    id: 'slate-cyan',
    label: 'Slate Cyan',
    description: 'Quiet professional slate with cyan highlights.',
    primary: '#334155',
    secondary: '#0891b2',
    accent: '#22c55e',
    primaryDark: '#0f172a',
    secondaryDark: '#0e7490',
    soft: '#f8fafc',
    border: '#cbd5e1',
    ring: 'rgba(8, 145, 178, 0.18)',
  },
  {
    id: 'sunset',
    label: 'Sunset Coral',
    description: 'Warm coral with violet depth.',
    primary: '#f97316',
    secondary: '#9333ea',
    accent: '#14b8a6',
    primaryDark: '#c2410c',
    secondaryDark: '#6b21a8',
    soft: '#fff7ed',
    border: '#fed7aa',
    ring: 'rgba(249, 115, 22, 0.18)',
  },
];

const MAX_AVATAR_UPLOAD_BYTES = 5 * 1024 * 1024;
const SUPPORTED_AVATAR_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const AVATAR_UPLOAD_REQUIREMENTS = 'Use a PNG, JPG, or WEBP image under 5 MB.';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);
  private readonly api = inject(RegistrarApiService);
  readonly financeNotifications = inject(FinanceNotificationService);
  readonly globalSearch = inject(GlobalSearchService);
  readonly chat = inject(FloatingChatService);

  readonly pageTitle = signal('Dashboard');
  readonly pageSubtitle = signal('Overview of registrar and finance operations');
  private readonly currentUrl = signal(this.router.url);
  private readonly currentUserSignal = signal<any>(null);
  private readonly announcementCount = signal(0);
  private readonly dismissedStorageKey = 'sfxsai.topbar.dismissed-notifications.v1';
  private readonly themeStorageKey = 'sfxsai.portal.theme.v1';
  readonly dismissedNotificationIds = signal<string[]>(this.loadDismissedNotificationIds());
  readonly isNotificationDropdownOpen = signal(false);
  readonly isThemePickerOpen = signal(false);
  readonly portalThemes = PORTAL_THEMES;
  readonly selectedThemeId = signal(PORTAL_THEMES[0].id);
  customThemeColor = PORTAL_THEMES[0].primary;
  readonly activeTheme = computed(() => {
    if (this.selectedThemeId() === 'custom') {
      return this.buildCustomTheme(this.customThemeColor);
    }

    return this.portalThemes.find(theme => theme.id === this.selectedThemeId()) ?? this.portalThemes[0];
  });
  readonly notificationItems = computed(() => buildTopbarNotifications({
    role: this.currentUserSignal()?.role,
    portal: this.portalSegment(),
    chatUnreadCount: this.chat.unreadCount(),
    chatUnreadSenderName: this.chat.unreadSenderName(),
    announcementCount: this.resolvedAnnouncementCount(),
    dismissedIds: this.dismissedNotificationIds(),
  }));
  readonly notificationCount = computed(() =>
    this.notificationItems().reduce((total, item) => total + item.count, 0),
  );
  readonly hasNotifications = computed(() => this.notificationCount() > 0);

  academicYears: any[] = [];
  selectedAyId: string = '';
  searchText = '';
  currentUser: any = null;
  isUploadingAvatar = false;
  avatarToast = {
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error'
  };

  // Search logic
  private searchSubject = new Subject<string>();
  searchResults: any[] = [];
  isSearchFocused = false;
  private teacherAnnouncementsBound = false;
  private studentAnnouncementsBound = false;

  constructor() {
    this.restorePortalThemePreference();

    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(auth => {
      this.currentUser = auth?.user || null;
      this.currentUserSignal.set(this.currentUser);
      this.bindAnnouncementSourceForRole(this.currentUser?.role);
    });

    this.syncPageMeta();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.syncPageMeta();
      });

    this.api.refreshAcademicYears();

    this.api.academicYears$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ays => {
      this.academicYears = ays;
    });

    this.api.activeAcademicYear$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ay => {
      if (ay) {
        this.selectedAyId = ay.id;
        this.financeNotifications.refreshAssessmentQueue();
      }
    });

    this.globalSearch.query$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(query => {
      this.searchText = query;
    });
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.searchResults = [];
          return of([]);
        }
        return this.api.searchStudents(query.trim(), this.selectedAyId);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  onSearchChange(query: string) {
    this.globalSearch.setQuery(query);
    this.searchSubject.next(query);
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    if (this.searchText) {
      this.searchSubject.next(this.searchText);
    }
  }

  onSearchBlur() {
    // Delay hiding dropdown so click events can register
    setTimeout(() => {
      this.isSearchFocused = false;
    }, 200);
  }

  clearSearch() {
    this.searchText = '';
    this.searchResults = [];
    this.isSearchFocused = false;
    this.globalSearch.setQuery('');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeNotifications();
      this.closeThemePicker();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      document.getElementById('global-search-input')?.focus();
    }
  }

  @HostListener('document:click')
  closeNotificationDropdownFromDocument(): void {
    this.closeNotifications();
    this.closeThemePicker();
  }

  toggleNotifications(): void {
    this.isNotificationDropdownOpen.update(isOpen => !isOpen);
  }

  closeNotifications(): void {
    this.isNotificationDropdownOpen.set(false);
  }

  toggleThemePicker(): void {
    this.isThemePickerOpen.update(isOpen => !isOpen);
  }

  closeThemePicker(): void {
    this.isThemePickerOpen.set(false);
  }

  selectPortalTheme(themeId: string): void {
    const theme = this.portalThemes.find(item => item.id === themeId);
    if (!theme) {
      return;
    }

    this.selectedThemeId.set(theme.id);
    this.customThemeColor = theme.primary;
    this.applyPortalTheme(theme);
    this.persistPortalThemePreference();
  }

  onCustomThemeColorChange(color: string): void {
    const normalizedColor = this.normalizeHexColor(color);
    if (!normalizedColor) {
      return;
    }

    this.customThemeColor = normalizedColor;
    this.selectedThemeId.set('custom');
    this.applyPortalTheme(this.buildCustomTheme(normalizedColor));
    this.persistPortalThemePreference();
  }

  activeThemeGradient(): string {
    const theme = this.activeTheme();
    return `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`;
  }

  selectNotification(notification: TopbarNotification): void {
    const dismissedIds = dismissTopbarNotification(this.dismissedNotificationIds(), notification.id);
    this.dismissedNotificationIds.set(dismissedIds);
    this.persistDismissedNotificationIds(dismissedIds);
    this.closeNotifications();
    
    if (notification.type === 'chat') {
      this.chat.open();
    } else {
      this.router.navigateByUrl(notification.destination);
    }
  }

  onAyChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const ay = this.academicYears.find(y => y.id === target.value);
    if (ay) {
      this.selectedAyId = ay.id;
      this.api.setActiveAcademicYear(ay);
      this.financeNotifications.refreshAssessmentQueue();
    }
  }

  private syncPageMeta(): void {
    let route = this.activatedRoute;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.pageTitle.set(route.snapshot?.data?.['pageTitle'] ?? 'Dashboard');
    this.pageSubtitle.set(route.snapshot?.data?.['pageSubtitle'] ?? 'Overview of registrar and finance operations');
  }

  private portalSegment(): string {
    const path = this.currentUrl().split('?')[0].split('#')[0];
    return path.split('/').filter(Boolean)[0] || (this.currentUserSignal()?.role || 'admin').toLowerCase();
  }

  private resolvedAnnouncementCount(): number {
    const role = (this.currentUserSignal()?.role || '').toUpperCase();
    if (role === 'FINANCE') {
      return this.financeNotifications.learnersNeedingAssessmentCount();
    }

    return this.announcementCount();
  }

  private bindAnnouncementSourceForRole(role?: string): void {
    const normalizedRole = (role || '').toUpperCase();

    if (normalizedRole === 'TEACHER' && !this.teacherAnnouncementsBound) {
      this.teacherAnnouncementsBound = true;
      this.injector.get(TeacherPortalService).state$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(state => {
          this.announcementCount.set(Array.isArray(state.announcements) ? state.announcements.length : 0);
        });
      return;
    }

    if (normalizedRole === 'STUDENT' && !this.studentAnnouncementsBound) {
      this.studentAnnouncementsBound = true;
      this.injector.get(StudentPortalService).state$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(state => {
          const unread = Array.isArray(state.announcements)
            ? state.announcements.filter(item => !item.read).length
            : 0;
          this.announcementCount.set(unread);
        });
      return;
    }

    if (!['TEACHER', 'STUDENT'].includes(normalizedRole)) {
      this.announcementCount.set(0);
    }
  }

  private loadDismissedNotificationIds(): string[] {
    try {
      const stored = localStorage.getItem(this.dismissedStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  private persistDismissedNotificationIds(ids: string[]): void {
    try {
      localStorage.setItem(this.dismissedStorageKey, JSON.stringify(ids));
    } catch {
      // Notification dismissal should never block navigation.
    }
  }

  private restorePortalThemePreference(): void {
    try {
      const stored = localStorage.getItem(this.themeStorageKey);
      const parsed = stored ? JSON.parse(stored) : null;
      const storedThemeId = typeof parsed?.themeId === 'string' ? parsed.themeId : PORTAL_THEMES[0].id;
      const storedCustomColor = this.normalizeHexColor(parsed?.customColor) ?? PORTAL_THEMES[0].primary;

      if (storedThemeId === 'custom') {
        this.customThemeColor = storedCustomColor;
        this.selectedThemeId.set('custom');
        this.applyPortalTheme(this.buildCustomTheme(storedCustomColor));
        return;
      }

      const theme = this.portalThemes.find(item => item.id === storedThemeId) ?? PORTAL_THEMES[0];
      this.customThemeColor = theme.primary;
      this.selectedThemeId.set(theme.id);
      this.applyPortalTheme(theme);
    } catch {
      this.applyPortalTheme(PORTAL_THEMES[0]);
    }
  }

  private persistPortalThemePreference(): void {
    try {
      localStorage.setItem(this.themeStorageKey, JSON.stringify({
        themeId: this.selectedThemeId(),
        customColor: this.customThemeColor,
      }));
    } catch {
      // Theme selection should not block the portal.
    }
  }

  private applyPortalTheme(theme: PortalTheme): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty('--sms-theme-primary', theme.primary);
    root.style.setProperty('--sms-theme-secondary', theme.secondary);
    root.style.setProperty('--sms-theme-accent', theme.accent);
    root.style.setProperty('--sms-theme-primary-dark', theme.primaryDark);
    root.style.setProperty('--sms-theme-secondary-dark', theme.secondaryDark);
    root.style.setProperty('--sms-theme-soft', theme.soft);
    root.style.setProperty('--sms-theme-border', theme.border);
    root.style.setProperty('--sms-theme-ring', theme.ring);
    root.style.setProperty('--sms-theme-gradient', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--sms-theme-hero-gradient', `linear-gradient(135deg, ${theme.primaryDark}, ${theme.secondaryDark})`);
    root.style.setProperty('--sms-theme-shadow', this.hexToShadow(theme.primary));
  }

  private buildCustomTheme(primary: string): PortalTheme {
    const safePrimary = this.normalizeHexColor(primary) ?? PORTAL_THEMES[0].primary;

    return {
      id: 'custom',
      label: 'Custom Color',
      description: 'Your selected portal accent.',
      primary: safePrimary,
      secondary: this.mixHex(safePrimary, '#2563eb', 0.48),
      accent: this.mixHex(safePrimary, '#f59e0b', 0.45),
      primaryDark: this.mixHex(safePrimary, '#0f172a', 0.28),
      secondaryDark: this.mixHex(safePrimary, '#1e1b4b', 0.44),
      soft: this.mixHex(safePrimary, '#ffffff', 0.9),
      border: this.mixHex(safePrimary, '#ffffff', 0.62),
      ring: this.hexToRing(safePrimary, 0.18),
    };
  }

  private normalizeHexColor(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
      return trimmed.toLowerCase();
    }

    return null;
  }

  private mixHex(hexA: string, hexB: string, weightB: number): string {
    const a = this.hexToRgb(hexA);
    const b = this.hexToRgb(hexB);
    const weightA = 1 - weightB;

    return `#${[a.r * weightA + b.r * weightB, a.g * weightA + b.g * weightB, a.b * weightA + b.b * weightB]
      .map(channel => Math.round(channel).toString(16).padStart(2, '0'))
      .join('')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const normalized = this.normalizeHexColor(hex) ?? PORTAL_THEMES[0].primary;
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
    };
  }

  private hexToRing(hex: string, alpha: number): string {
    const rgb = this.hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  private hexToShadow(hex: string): string {
    const rgb = this.hexToRgb(hex);
    return `0 18px 40px -28px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
  }


  profileRoute(): string | null {
    const role = (this.currentUser?.role || '').toUpperCase();
    if (!['REGISTRAR', 'FINANCE', 'TEACHER', 'STUDENT'].includes(role)) {
      return null;
    }

    const portal = this.portalSegment();
    return `/${portal}/profile`;
  }

  logout() {
    this.authService.logout();
  }

  userInitials(): string {
    const source = this.currentUser?.email || 'SFXSAI';
    return source.slice(0, 2).toUpperCase();
  }

  onAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!this.isSupportedAvatarFile(file)) {
      input.value = '';
      this.showAvatarToast('Upload failed', AVATAR_UPLOAD_REQUIREMENTS, 'error');
      return;
    }

    this.isUploadingAvatar = true;
    this.api.uploadStaffAvatar(file).subscribe({
      next: (file) => {
        this.authService.updateCurrentUser({ avatarUrl: file.publicUrl });
        this.isUploadingAvatar = false;
        input.value = '';
        this.showAvatarToast('Avatar saved', 'Staff profile photo was uploaded.', 'success');
      },
      error: (error) => {
        this.isUploadingAvatar = false;
        input.value = '';
        const isAccessDenied = error?.status === 401 || error?.status === 403;
        this.showAvatarToast(
          'Upload failed',
          isAccessDenied ? 'Your account is not allowed to upload a profile photo.' : AVATAR_UPLOAD_REQUIREMENTS,
          'error',
        );
      }
    });
  }

  private isSupportedAvatarFile(file: File): boolean {
    return SUPPORTED_AVATAR_MIME_TYPES.has(file.type) && file.size <= MAX_AVATAR_UPLOAD_BYTES;
  }

  private showAvatarToast(title: string, message: string, type: 'success' | 'error') {
    this.avatarToast = { show: true, title, message, type };
    setTimeout(() => {
      this.avatarToast = { ...this.avatarToast, show: false };
    }, 3500);
  }
}
