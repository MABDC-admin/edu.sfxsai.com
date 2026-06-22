import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RegistrarApiService } from '../../core/services/registrar-api.service';
import {
  PrincipalOverviewPayload,
  PrincipalPortalState,
  mapPrincipalOverviewToState,
} from './principal-portal.util';

export type {
  PrincipalAlert,
  PrincipalCalendarItem,
  PrincipalPortalState,
  PrincipalTrend,
} from './principal-portal.util';

export interface PrincipalPortalLoadState {
  loading: boolean;
  error: string;
}

const STORAGE_KEY = 'sfxsai.principal.portal.state.v1';

const emptyState: PrincipalPortalState = {
  principal: {
    name: '',
    email: '',
    title: '',
    phone: '',
    office: '',
  },
  academicYear: null,
  teachers: [],
  students: [],
  classes: [],
  subjects: [],
  trends: [],
  alerts: [],
  calendar: [],
};

@Injectable({ providedIn: 'root' })
export class PrincipalPortalService {
  private readonly http = inject(HttpClient);
  private readonly registrarApi = inject(RegistrarApiService);
  private readonly apiUrl = `${environment.apiUrl}/principal`;
  private readonly stateSubject = new BehaviorSubject<PrincipalPortalState>(emptyState);
  private readonly loadStateSubject = new BehaviorSubject<PrincipalPortalLoadState>({ loading: false, error: '' });

  readonly state$ = this.stateSubject.asObservable();
  readonly loadState$ = this.loadStateSubject.asObservable();

  constructor() {
    this.clearStaleMockState();
  }

  snapshot(): PrincipalPortalState {
    return this.stateSubject.value;
  }

  load(academicYearId?: string) {
    this.loadStateSubject.next({ loading: true, error: '' });
    const selectedAcademicYearId = academicYearId ?? this.registrarApi.getActiveAcademicYearId();

    if (selectedAcademicYearId) {
      this.fetchOverview(selectedAcademicYearId);
      return;
    }

    this.registrarApi.getAcademicYears().pipe(
      map(years => years.find(year => year.isActive) ?? years[0] ?? null),
      switchMap(activeYear => {
        if (!activeYear?.id) {
          return of({ error: 'No active academic year is available for Principal reporting.' });
        }
        this.registrarApi.setActiveAcademicYear(activeYear);
        return this.getOverview(activeYear.id);
      }),
      catchError(() => of({ error: 'Unable to load academic years for Principal reporting.' })),
    ).subscribe(result => this.applyOverviewResult(result));
  }

  private fetchOverview(academicYearId: string) {
    this.getOverview(academicYearId)
      .subscribe(result => this.applyOverviewResult(result));
  }

  private getOverview(academicYearId: string) {
    return this.http.get<PrincipalOverviewPayload>(`${this.apiUrl}/overview`, {
      params: { academicYearId },
    }).pipe(
      map(payload => ({ payload })),
      catchError(() => of({ error: 'Unable to load live Principal overview.' })),
    );
  }

  private applyOverviewResult(result: { payload: PrincipalOverviewPayload } | { error: string }) {
    if ('payload' in result) {
      this.stateSubject.next(mapPrincipalOverviewToState(result.payload));
      this.loadStateSubject.next({ loading: false, error: '' });
      return;
    }

    this.stateSubject.next(emptyState);
    this.loadStateSubject.next({ loading: false, error: result.error });
  }

  private clearStaleMockState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The portal can still load live data if storage is unavailable.
    }
  }
}
