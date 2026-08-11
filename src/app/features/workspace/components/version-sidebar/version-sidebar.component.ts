import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doc, DocVersion } from '../../../../core/documents/document.models';

@Component({
  selector: 'app-version-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-40 bg-black/30" (click)="closeClicked.emit()"></div>
      <div class="fixed right-0 top-0 z-50 h-full w-[400px] max-w-full overflow-y-auto bg-white p-6 shadow-2xl">
        <button
          type="button"
          class="float-right text-2xl text-slate-400 hover:text-slate-600"
          (click)="closeClicked.emit()"
        >
          ✕
        </button>
        <h3 class="mb-1 text-lg font-semibold">📜 Document Versions</h3>
        <p class="mb-4 text-[13px] text-slate-500">Switch versions — upload and delete are not available in this phase</p>

        <div class="flex flex-col gap-2.5">
          @for (v of doc?.versions ?? []; track v.id) {
            <div
              class="flex items-center justify-between gap-3 rounded-lg border p-4"
              [class]="
                v.id === doc?.activeVersionId
                  ? 'border-green-300 bg-green-50/40'
                  : 'border-slate-200 bg-slate-50'
              "
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-sm font-semibold">
                  {{ v.label }} {{ v.id === doc?.activeVersionId ? '(Active) ✅' : '' }}
                </span>
                <span class="text-xs text-slate-500">
                  {{ v.createdAt | date: 'MMM d, y' }}
                </span>
              </div>
              <div class="flex shrink-0 gap-1.5">
                @if (v.id !== doc?.activeVersionId) {
                  <button
                    type="button"
                    class="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600"
                    (click)="switchClicked.emit(v)"
                  >
                    Switch
                  </button>
                } @else {
                  <span class="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-400"
                    >Active</span
                  >
                }
                <button
                  type="button"
                  class="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-400 disabled:cursor-not-allowed"
                  disabled
                  title="Version delete is not available in this phase"
                >
                  🗑
                </button>
              </div>
            </div>
          }
        </div>

        <div class="mt-4 border-t-2 border-dashed border-slate-200 pt-4">
          <button
            type="button"
            class="w-full cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-400"
            disabled
            title="New version upload is not available in this phase"
          >
            ⬆ Upload New Version
          </button>
          <p class="mt-2 text-center text-xs text-slate-500">Not available in this phase</p>
        </div>
      </div>
    }
  `,
})
export class VersionSidebarComponent {
  @Input() open = false;
  @Input() doc: Doc | null = null;

  @Output() closeClicked = new EventEmitter<void>();
  @Output() switchClicked = new EventEmitter<DocVersion>();
}
