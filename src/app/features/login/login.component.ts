import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LogoComponent } from '../../shared/logo/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LogoComponent],
  template: `
    <div class="flex min-h-screen">
      <div
        class="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-14"
      >
        <div class="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"></div>

        <app-logo size="lg" theme="dark" class="relative" />

        <div class="relative flex flex-col gap-6">
          <h2 class="max-w-md text-3xl font-semibold leading-tight text-white">
            Ask your documents anything — grounded, cited, verifiable.
          </h2>
          <ul class="flex flex-col gap-3 text-sm text-white/70">
            <li class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              One-shot Q&amp;A over your uploaded documents
            </li>
            <li class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Multi-turn assistant with conversation memory
            </li>
            <li class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Domain-tuned claims workflow queries
            </li>
          </ul>
        </div>

        <p class="relative text-xs text-white/40">© 2026 Cognitive. All rights reserved.</p>
      </div>

      <div class="flex w-full items-center justify-center bg-slate-50 p-8 lg:w-1/2">
        <div class="w-full max-w-sm">
          <div class="mb-8 flex justify-center lg:hidden">
            <app-logo size="lg" theme="light" />
          </div>

          <form
            [formGroup]="form"
            (ngSubmit)="submit()"
            class="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-md"
          >
            <h1 class="mb-1 text-xl font-semibold text-slate-900">Welcome back</h1>
            <p class="mb-6 text-sm text-slate-500">Log in to continue to your workspace.</p>

            <label class="mb-1 block text-sm font-medium text-slate-700" for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <label class="mb-1 block text-sm font-medium text-slate-700" for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              [disabled]="form.invalid || submitting()"
              class="w-full rounded-md bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ submitting() ? 'Logging in…' : 'Log in' }}
            </button>

            <p class="mt-5 text-center text-sm text-slate-500">
              No account? <a routerLink="/register" class="font-medium text-blue-700 hover:underline">Register</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.submitting.set(true);
    try {
      await this.authService.login(this.form.getRawValue());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/workspace';
      this.router.navigateByUrl(returnUrl);
    } finally {
      this.submitting.set(false);
    }
  }
}
