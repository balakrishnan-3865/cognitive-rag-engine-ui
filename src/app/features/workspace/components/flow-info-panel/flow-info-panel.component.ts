import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatVariant } from '../chat-panel/chat-panel.component';

interface FlowInfo {
  title: string;
  description: string;
  steps: string[];
  diagram: string;
}

const FLOW_INFO: Record<ChatVariant, FlowInfo> = {
  qa: {
    title: '💬 Simple Chat — flow',
    description: 'One-shot RAG query. No conversation memory is kept between questions.',
    steps: [
      'User submits question',
      'Query embedded + hybrid search (vector + keyword) over document chunks',
      'Candidate chunks re-ranked and merged',
      'Context compression / summarization of top chunks',
      'LLM answers grounded in the compressed context',
      'Response returned with cited source chunks',
    ],
    diagram: `flowchart TD
  A[User question] --> B[Embed query]
  B --> C1[Vector search]
  B --> C2[Keyword search]
  C1 --> D[Merge + re-rank]
  C2 --> D
  D --> E[Context compression / summarization]
  E --> F[LLM prompt: question + context]
  F --> G[Answer + cited sources]`,
  },
  assistant: {
    title: '🧠 Memory Chat — flow',
    description: 'Multi-turn chat. Prior turns in the conversation are carried into each new answer.',
    steps: [
      'User submits question + conversation history',
      'Query embedded + hybrid search (vector + keyword) over document chunks',
      'Candidate chunks re-ranked and merged',
      'Context compression / summarization of top chunks + history',
      'LLM answers using history + compressed context',
      'Response returned with cited sources, history updated',
    ],
    diagram: `flowchart TD
  H[Conversation history] --> B
  A[User question] --> B[Embed query]
  B --> C1[Vector search]
  B --> C2[Keyword search]
  C1 --> D[Merge + re-rank]
  C2 --> D
  D --> E[Context compression / summarization]
  H --> E
  E --> F[LLM prompt: history + question + context]
  F --> G[Answer + cited sources]
  G --> H`,
  },
  claims: {
    title: '🔧 Claims Workflow — flow',
    description: 'Single-shot claims-domain query. No conversation memory.',
    steps: [
      'User submits claims-domain question',
      'Query embedded + hybrid search (vector + keyword) scoped to claims data',
      'Candidate chunks re-ranked and merged',
      'Context compression / summarization of top chunks',
      'LLM answers with claims-tuned structured output',
      'Response returned with cited source chunks',
    ],
    diagram: `flowchart TD
  A[User question] --> B[Embed query]
  B --> C1[Vector search — claims scope]
  B --> C2[Keyword search — claims scope]
  C1 --> D[Merge + re-rank]
  C2 --> D
  D --> E[Context compression / summarization]
  E --> F[LLM prompt: claims schema + context]
  F --> G[Structured answer + cited sources]`,
  },
};

@Component({
  selector: 'app-flow-info-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-40 bg-black/30" (click)="closeClicked.emit()"></div>
      <div
        class="fixed right-0 top-0 z-50 h-full w-[40vw] min-w-[560px] max-w-full overflow-y-auto bg-white p-8 shadow-2xl"
      >
        <button
          type="button"
          class="float-right text-2xl text-slate-400 hover:text-slate-600"
          (click)="closeClicked.emit()"
        >
          ✕
        </button>
        <h3 class="mb-1 text-xl font-semibold text-slate-900">{{ info().title }}</h3>
        <p class="mb-6 text-sm text-slate-500">{{ info().description }}</p>

        <div class="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
          <div class="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <span class="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
            Mermaid flowchart — placeholder
          </div>
          <pre
            class="overflow-x-auto rounded bg-white p-4 text-[12.5px] leading-relaxed text-slate-500"
          ><code>{{ info().diagram }}</code></pre>
          <p class="mt-3 text-xs text-slate-400">
            Real diagram (hybrid search, re-ranking, summarization) to be rendered here — this is a template
            placeholder.
          </p>
        </div>

        <ol class="mt-6 flex flex-col gap-3">
          @for (step of info().steps; track $index) {
            <li class="flex items-start gap-3 text-sm text-slate-700">
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-50 text-[11px] font-semibold text-blue-700"
                >{{ $index + 1 }}</span
              >
              {{ step }}
            </li>
          }
        </ol>
      </div>
    }
  `,
})
export class FlowInfoPanelComponent {
  @Input() open = false;
  @Input({ required: true }) variant!: ChatVariant;

  @Output() closeClicked = new EventEmitter<void>();

  info(): FlowInfo {
    return FLOW_INFO[this.variant];
  }
}
