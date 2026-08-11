import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QaService } from '../../../../core/qa/qa.service';
import { AssistantService } from '../../../../core/assistant/assistant.service';
import { ClaimsService } from '../../../../core/claims/claims.service';
import { MessageSourcesComponent } from '../message-sources/message-sources.component';
import { SourceChunk } from '../../../../models/types';

export type ChatVariant = 'qa' | 'assistant' | 'claims';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: SourceChunk[];
}

const PLACEHOLDER: Record<ChatVariant, string> = {
  qa: 'Ask a one-shot question about this document…',
  assistant: 'Ask a follow-up — this chat remembers context…',
  claims: 'Ask the claims workflow a single-shot question…',
};

const EMPTY_STATE: Record<ChatVariant, string> = {
  qa: 'One-shot RAG query — ask anything about the document.',
  assistant: 'Multi-turn chat — I remember this conversation.',
  claims: 'Single-shot claims workflow query — no conversation memory.',
};

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageSourcesComponent],
  template: `
    <div class="flex h-full min-h-0 flex-col">
      <div class="min-h-0 flex-1 overflow-y-auto px-10 py-7">
        <div class="mx-auto flex max-w-4xl flex-col gap-4">
          @if (messages().length === 0) {
            <div
              class="max-w-[75%] self-start rounded-md border border-slate-200 border-l-4 border-l-orange-400 bg-white px-4 py-3 text-sm text-slate-700"
            >
              🤖 {{ emptyState() }}
            </div>
          }
          @for (m of messages(); track $index) {
            <div class="flex w-full flex-col" [class]="m.role === 'user' ? 'items-end' : 'items-start'">
              <div
                class="max-w-[75%] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-relaxed"
                [class]="
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 border-l-4 border-l-orange-400 bg-white text-slate-800'
                "
              >
                <strong>{{ m.role === 'user' ? '👤 You' : '🤖 Assistant' }}</strong><br />
                {{ m.text }}
              </div>
              @if (m.sources?.length) {
                <app-message-sources [sources]="m.sources!" />
              }
            </div>
          }
          @if (loading()) {
            <div
              class="max-w-[75%] self-start rounded-md border border-slate-200 border-l-4 border-l-orange-400 bg-white px-4 py-3 text-sm text-slate-400"
            >
              🤖 Thinking…
            </div>
          }
        </div>
      </div>
      <div class="border-t border-slate-200 bg-white px-10 py-5">
        <div class="mx-auto flex max-w-4xl gap-3">
          <input
            type="text"
            class="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            [placeholder]="placeholder()"
            [(ngModel)]="draft"
            [disabled]="loading() || documentId == null"
            (keyup.enter)="send()"
          />
          <button
            type="button"
            class="rounded-md bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="loading() || !draft.trim() || documentId == null"
            (click)="send()"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ChatPanelComponent {
  @Input({ required: true }) variant!: ChatVariant;
  @Input() documentId: number | null = null;

  private readonly qaService = inject(QaService);
  private readonly assistantService = inject(AssistantService);
  private readonly claimsService = inject(ClaimsService);

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly loading = signal(false);
  protected draft = '';
  private conversationId: number | undefined;

  placeholder(): string {
    return PLACEHOLDER[this.variant];
  }

  emptyState(): string {
    return EMPTY_STATE[this.variant];
  }

  async send(): Promise<void> {
    const text = this.draft.trim();
    if (!text || this.loading()) return;
    this.draft = '';
    this.messages.update((msgs) => [...msgs, { role: 'user', text }]);
    this.loading.set(true);
    try {
      if (this.variant === 'qa') {
        const res = await this.qaService.ask(text, this.documentId ?? undefined);
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', text: res.answered ? res.answer : res.reasonMessage, sources: res.sources },
        ]);
      } else if (this.variant === 'assistant') {
        const res = await this.assistantService.ask(text, this.conversationId, this.documentId ?? undefined);
        this.conversationId = res.conversationId;
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', text: res.answered ? res.answer : res.reasonMessage, sources: res.sources },
        ]);
      } else {
        const res = await this.claimsService.query(text, this.documentId ?? undefined);
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', text: res.answered ? res.answer : res.reasonMessage, sources: res.sources },
        ]);
      }
    } catch {
      this.messages.update((msgs) => msgs.slice(0, -1));
      this.draft = text;
    } finally {
      this.loading.set(false);
    }
  }

  resetConversation(): void {
    this.messages.set([]);
    this.conversationId = undefined;
  }
}
