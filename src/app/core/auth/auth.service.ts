import { Injectable, computed, signal } from '@angular/core';
import { TokenPairResponse, UserSummaryResponse } from '../../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
}
