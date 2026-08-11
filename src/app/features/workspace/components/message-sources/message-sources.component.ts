import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceChunk } from '../../../../models/types';
import { truncateAtWordBoundary } from '../../../../shared/text/truncate';

const TEXT_CHAR_LIMIT = 320;

@Component({
  selector: 'app-message-sources',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-2 w-full">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        [attr.aria-expanded]="expanded()"
        (click)="expanded.set(!expanded())"
      >
        📎 {{ sources.length }} source{{ sources.length === 1 ? '' : 's' }}
        <span class="text-[10px]">{{ expanded() ? '▲' : '▼' }}</span>
      </button>

      @if (expanded()) {
        <div class="mt-2 flex flex-col gap-2">
          @for (s of sources; track s.chunkId; let i = $index) {
            <div class="w-full rounded-md border border-slate-200 bg-slate-50 p-3.5 text-[13px] leading-relaxed text-slate-600">
              <div class="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>#{{ i + 1 }} · chunk {{ s.chunkNumber }} · doc {{ s.documentId }} · {{ s.source }}</span>
                <span>{{ relevancePercent(s) }}% match</span>
              </div>
              <p class="whitespace-pre-wrap">{{ visibleText(s) }}</p>
              @if (s.text.length > charLimit) {
                <button
                  type="button"
                  class="mt-1.5 text-[11px] font-medium text-blue-600 hover:underline"
                  (click)="toggleChunk(s.chunkId)"
                >
                  {{ isChunkExpanded(s.chunkId) ? 'Show less' : 'Show full chunk' }}
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MessageSourcesComponent {
  @Input({ required: true }) sources!: SourceChunk[];

  protected readonly charLimit = TEXT_CHAR_LIMIT;
  protected readonly expanded = signal(false);
  private readonly expandedChunkIds = signal<Set<number>>(new Set());

  relevancePercent(chunk: SourceChunk): number {
    return Math.round(chunk.similarity * 100);
  }

  isChunkExpanded(chunkId: number): boolean {
    return this.expandedChunkIds().has(chunkId);
  }

  toggleChunk(chunkId: number): void {
    const next = new Set(this.expandedChunkIds());
    if (next.has(chunkId)) {
      next.delete(chunkId);
    } else {
      next.add(chunkId);
    }
    this.expandedChunkIds.set(next);
  }

  visibleText(chunk: SourceChunk): string {
    return this.isChunkExpanded(chunk.chunkId)
      ? chunk.text
      : truncateAtWordBoundary(chunk.text, this.charLimit);
  }
}
