import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doc, DocVersion } from '../../../../core/documents/document.models';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-9 py-5"
    >
      <div class="flex flex-wrap items-center gap-3.5">
        @if (doc) {
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
            (click)="backClicked.emit()"
          >
            ⬅ Documents
          </button>
          <span class="text-lg font-semibold text-slate-900">📄 {{ doc.title }}</span>
          <span class="rounded bg-blue-50 px-2 py-0.5 text-[12px] font-medium text-blue-700"
            >DOC-{{ doc.id }}</span
          >
          <span
            class="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium"
            [class]="statusClasses()"
          >
            <span>●</span> {{ doc.status }}
          </span>
        } @else {
          <span class="text-lg font-semibold text-slate-400">No document selected</span>
        }
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        @if (doc && doc.versions.length > 1) {
          <select
            class="min-w-[160px] rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-700"
            [value]="doc.activeVersionId"
            (change)="onVersionSelect($event)"
          >
            @for (v of doc.versions; track v.id) {
              <option [value]="v.id">{{ v.label }} — {{ v.createdAt | date: 'MMM d, y' }}</option>
            }
          </select>
        }
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:bg-slate-200"
          [disabled]="!!doc"
          [title]="doc ? 'New version upload is not available in this phase' : ''"
          (click)="uploadClicked.emit()"
        >
          ⬆ {{ doc ? 'New version' : 'Upload' }}
        </button>
        @if (doc) {
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            (click)="versionsClicked.emit()"
          >
            📜 Versions
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            (click)="downloadClicked.emit()"
          >
            ⬇ Download
          </button>
        }
      </div>
    </header>
  `,
})
export class DocumentHeaderComponent {
  @Input() doc: Doc | null = null;

  @Output() backClicked = new EventEmitter<void>();
  @Output() uploadClicked = new EventEmitter<void>();
  @Output() versionsClicked = new EventEmitter<void>();
  @Output() downloadClicked = new EventEmitter<void>();
  @Output() versionSelected = new EventEmitter<DocVersion>();

  onVersionSelect(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const version = this.doc?.versions.find((v) => v.id === id);
    if (version) this.versionSelected.emit(version);
  }

  statusClasses(): string {
    switch (this.doc?.status) {
      case 'READY':
        return 'bg-green-50 text-green-700';
      case 'PENDING':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-red-50 text-red-700';
    }
  }
}
