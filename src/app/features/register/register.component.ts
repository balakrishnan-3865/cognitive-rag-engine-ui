import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { LogoComponent } from '../../shared/logo/logo.component';

function passwordRuleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password: string = control.value ?? '';
    const username: string = control.parent?.get('username')?.value ?? '';
    const email: string = control.parent?.get('email')?.value ?? '';
    const emailLocalPart = email.split('@')[0] ?? '';

    if (!password) return null;

    const errors: ValidationErrors = {};

    if (password.length < 12 || password.length > 64) {
      errors['length'] = true;
    }
    if (new TextEncoder().encode(password).length > 72) {
      errors['byteLength'] = true;
    }

    let classes = 0;
    if (/[A-Z]/.test(password)) classes++;
    if (/[a-z]/.test(password)) classes++;
    if (/[0-9]/.test(password)) classes++;
    if (/[^A-Za-z0-9]/.test(password)) classes++;
    if (classes < 3) {
      errors['charClasses'] = true;
    }

    if (username && password === username) {
      errors['matchesUsername'] = true;
    }
    if (emailLocalPart && password === emailLocalPart) {
      errors['matchesEmail'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

@Component({
  selector: 'app-register',
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
            One workspace for every document your team relies on.
          </h2>
          <ul class="flex flex-col gap-3 text-sm text-white/70">
            <li class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Secure, per-user document scoping
            </li>
            <li class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Version history with async ingestion status
            </li>
            <li class="flex items-center gap-2.5">
              <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              Cited, source-grounded answers every time
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
            <h1 class="mb-1 text-xl font-semibold text-slate-900">Create your account</h1>
            <p class="mb-6 text-sm text-slate-500">Get started with Cognitive in a few seconds.</p>

            <label class="mb-1 block text-sm font-medium text-slate-700" for="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              class="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <label class="mb-1 block text-sm font-medium text-slate-700" for="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              class="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <label class="mb-1 block text-sm font-medium text-slate-700" for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <label class="mb-1 block text-sm font-medium text-slate-700" for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <label class="mb-1 block text-sm font-medium text-slate-700" for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <p class="mb-4 text-xs text-red-600">
                12–64 characters, at least 3 of uppercase/lowercase/digit/special, and must not match
                your username or email.
              </p>
            } @else {
              <p class="mb-4"></p>
            }

            <button
              type="submit"
              [disabled]="form.invalid || submitting()"
              class="w-full rounded-md bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ submitting() ? 'Registering…' : 'Register' }}
            </button>

            <p class="mt-5 text-center text-sm text-slate-500">
              Already have an account? <a routerLink="/login" class="font-medium text-blue-700 hover:underline">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordRuleValidator()]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.submitting.set(true);
    try {
      await this.authService.register(this.form.getRawValue());
      this.toastService.success('Account created. Please log in.');
      this.router.navigate(['/login']);
    } finally {
      this.submitting.set(false);
    }
  }
}
