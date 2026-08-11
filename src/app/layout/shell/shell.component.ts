import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar.component';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Documents', path: '/documents' },
  { label: 'Simple QA', path: '/qa' },
  { label: 'Conversational QA', path: '/assistant' },
  { label: 'Single Shot workflow', path: '/claims' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, LoadingBarComponent],
  template: `
    <app-loading-bar />
    <app-toast />
    <div class="flex h-screen bg-slate-50">
      <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0">
        <div class="px-6 py-5 text-lg font-semibold border-b border-slate-800">
          Cognitive RAG Engine
        </div>
        <nav class="flex-1 py-4">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-slate-800 border-l-blue-500"
              class="block px-6 py-3 text-sm border-l-4 border-transparent hover:bg-slate-800 transition-colors"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <span class="text-sm text-slate-500">
            @if (authService.currentUser(); as user) {
              Signed in as <span class="font-medium text-slate-700">{{ user.username }}</span>
            }
          </span>
          <button
            type="button"
            class="text-sm font-medium text-slate-600 hover:text-slate-900"
            (click)="logout()"
          >
            Log out
          </button>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly navItems = NAV_ITEMS;

  async logout(): Promise<void> {
    await this.authService.revoke().catch(() => undefined);
    this.router.navigate(['/login']);
  }
}
