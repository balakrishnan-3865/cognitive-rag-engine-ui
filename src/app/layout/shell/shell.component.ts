import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, LogoComponent],
  template: `
    <div class="flex h-screen min-h-0 flex-col bg-gradient-to-b from-slate-50 to-slate-200">
      <header
        class="flex shrink-0 items-center justify-between border-b-2 border-blue-600 bg-white px-8 py-3"
      >
        <app-logo size="sm" theme="light" />
        <div class="flex items-center gap-5">
          @if (authService.currentUser(); as user) {
            <span class="text-sm text-slate-500">
              Signed in as <span class="font-medium text-slate-700">{{ user.username }}</span>
            </span>
          }
          <button
            type="button"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            (click)="logout()"
          >
            Log out
          </button>
        </div>
      </header>
      <main class="min-h-0 flex-1 overflow-y-auto p-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.authService.revoke().catch(() => undefined);
    this.router.navigate(['/login']);
  }
}
