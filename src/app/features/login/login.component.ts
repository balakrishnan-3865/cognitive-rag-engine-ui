import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-slate-200"
      >
        <h1 class="text-xl font-semibold mb-6 text-slate-900">Log in</h1>

        <label class="block text-sm font-medium text-slate-700 mb-1" for="username">Username</label>
        <input
          id="username"
          type="text"
          formControlName="username"
          class="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />

        <label class="block text-sm font-medium text-slate-700 mb-1" for="password">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          class="w-full mb-6 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />

        <button
          type="submit"
          [disabled]="form.invalid || submitting()"
          class="w-full bg-slate-900 text-white text-sm font-medium py-2 rounded-md disabled:opacity-50"
        >
          {{ submitting() ? 'Logging in…' : 'Log in' }}
        </button>

        <p class="text-sm text-slate-500 mt-4 text-center">
          No account? <a routerLink="/register" class="text-slate-900 font-medium">Register</a>
        </p>
      </form>
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
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/qa';
      this.router.navigateByUrl(returnUrl);
    } finally {
      this.submitting.set(false);
    }
  }
}
