import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  TokenPairResponse,
  UserSummaryResponse,
} from '../../models/types';

const AUTH_BASE = `${environment.apiBaseUrl}/api/v1/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);
  private readonly currentUserSignal = signal<UserSummaryResponse | null>(null);

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);

  setSession(tokens: TokenPairResponse, user: UserSummaryResponse | null = null): void {
    this.accessTokenSignal.set(tokens.accessToken);
    this.refreshTokenSignal.set(tokens.refreshToken);
    if (user) {
      this.currentUserSignal.set(user);
    }
  }

  setUser(user: UserSummaryResponse): void {
    this.currentUserSignal.set(user);
  }

  clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  async register(req: RegisterRequest): Promise<UserSummaryResponse> {
    return this.http.post<UserSummaryResponse>(`${AUTH_BASE}/register`, req).toPromise() as Promise<UserSummaryResponse>;
  }

  async login(req: LoginRequest): Promise<UserSummaryResponse> {
    const tokens = (await this.http
      .post<TokenPairResponse>(`${AUTH_BASE}/login`, req)
      .toPromise()) as TokenPairResponse;
    this.setSession(tokens);
    return this.fetchMe();
  }

  async fetchMe(): Promise<UserSummaryResponse> {
    const user = (await this.http
      .get<UserSummaryResponse>(`${AUTH_BASE}/me`)
      .toPromise()) as UserSummaryResponse;
    this.setUser(user);
    return user;
  }

  async refresh(): Promise<TokenPairResponse> {
    const refreshToken = this.refreshTokenSignal();
    const tokens = (await this.http
      .post<TokenPairResponse>(`${AUTH_BASE}/refresh`, { refreshToken })
      .toPromise()) as TokenPairResponse;
    this.setSession(tokens);
    return tokens;
  }

  async revoke(): Promise<void> {
    const refreshToken = this.refreshTokenSignal();
    if (!refreshToken) {
      this.clearSession();
      return;
    }
    try {
      await this.http.post<void>(`${AUTH_BASE}/revoke`, { refreshToken }).toPromise();
    } finally {
      this.clearSession();
    }
  }
}
