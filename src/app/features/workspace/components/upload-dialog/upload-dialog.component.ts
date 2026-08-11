import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { validatePdfFile } from '../../../../core/documents/document.service';

export interface UploadSubmitEvent {
  file: File;
  title: string;
}

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <h3 class="mb-4 text-lg font-semibold">
            {{ isNewDocument ? 'Upload document' : 'Upload new version' }}
          </h3>

          @if (isNewDocument) {
            <label class="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              class="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="e.g. Q4_Financial_Report.pdf"
              [(ngModel)]="title"
            />
          }

          <label class="mb-1 block text-sm font-medium text-slate-700">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            class="mb-1 w-full text-sm"
            (change)="onFileChange($event)"
          />
          @if (error()) {
            <p class="mb-2 text-xs text-red-600">{{ error() }}</p>
          }
          <p class="mb-4 text-xs text-slate-400">PDF only, up to 20MB.</p>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              (click)="cancelClicked.emit()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              [disabled]="!canSubmit()"
              (click)="submit()"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UploadDialogComponent {
  @Input() open = false;
  @Input() isNewDocument = true;

  @Output() cancelClicked = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<UploadSubmitEvent>();

  protected title = '';
  protected readonly error = signal<string | null>(null);
  private selectedFile: File | null = null;

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) {
      this.selectedFile = null;
      return;
    }
    const validationError = validatePdfFile(file);
    if (validationError) {
      this.error.set(validationError);
      this.selectedFile = null;
      return;
    }
    this.error.set(null);
    this.selectedFile = file;
    if (this.isNewDocument && !this.title.trim()) {
      this.title = file.name;
    }
  }

  canSubmit(): boolean {
    return !!this.selectedFile && (!this.isNewDocument || !!this.title.trim());
  }

  submit(): void {
    if (!this.selectedFile || !this.canSubmit()) return;
    this.submitted.emit({ file: this.selectedFile, title: this.title.trim() });
    this.selectedFile = null;
    this.title = '';
    this.error.set(null);
  }
}
