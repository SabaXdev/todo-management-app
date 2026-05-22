import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageKey } from '../enums/storage-key.enum';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../models/auth.model';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  private readonly _currentUser = signal<User | null>(
    this.storage.get<User>(StorageKey.CurrentUser),
  );
  private readonly _accessToken = signal<string | null>(
    this.storage.get<string>(StorageKey.AccessToken),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  refreshCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap({
        next: (user) => {
          this._currentUser.set(user);
          this.storage.set(StorageKey.CurrentUser, user);
        },
        error: () => this.clearSession(),
      }),
    );
  }

  private persistSession(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    this._currentUser.set(res.user);
    this.storage.set(StorageKey.AccessToken, res.accessToken);
    this.storage.set(StorageKey.CurrentUser, res.user);
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    this.storage.remove(StorageKey.AccessToken);
    this.storage.remove(StorageKey.CurrentUser);
  }
}
