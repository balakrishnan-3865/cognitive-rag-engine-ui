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
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-slate-200"
      >
        <h1 class="text-xl font-semibold mb-6 text-slate-900">Register</h1>

        <label class="block text-sm font-medium text-slate-700 mb-1" for="firstName">First name</label>
        <input
          id="firstName"
          type="text"
          formControlName="firstName"
          class="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />

        <label class="block text-sm font-medium text-slate-700 mb-1" for="lastName">Last name</label>
        <input
          id="lastName"
          type="text"
          formControlName="lastName"
          class="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />

        <label class="block text-sm font-medium text-slate-700 mb-1" for="username">Username</label>
        <input
          id="username"
          type="text"
          formControlName="username"
          class="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />

        <label class="block text-sm font-medium text-slate-700 mb-1" for="email">Email</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />

        <label class="block text-sm font-medium text-slate-700 mb-1" for="password">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          class="w-full mb-2 px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <p class="text-xs text-red-600 mb-4">
            12–64 characters, at least 3 of uppercase/lowercase/digit/special, and must not match
            your username or email.
          </p>
        } @else {
          <p class="mb-4"></p>
        }

        <button
          type="submit"
          [disabled]="form.invalid || submitting()"
          class="w-full bg-slate-900 text-white text-sm font-medium py-2 rounded-md disabled:opacity-50"
        >
          {{ submitting() ? 'Registering…' : 'Register' }}
        </button>

        <p class="text-sm text-slate-500 mt-4 text-center">
          Already have an account? <a routerLink="/login" class="text-slate-900 font-medium">Log in</a>
        </p>
      </form>
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
