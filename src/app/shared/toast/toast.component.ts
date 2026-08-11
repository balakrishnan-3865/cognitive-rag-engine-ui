import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="rounded-md px-4 py-3 shadow-lg text-sm text-white flex items-start justify-between gap-3"
          [class.bg-red-600]="toast.variant === 'error'"
          [class.bg-green-600]="toast.variant === 'success'"
          [class.bg-slate-700]="toast.variant === 'info'"
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="opacity-80 hover:opacity-100"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
