import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="inline-flex items-center" [class]="size === 'lg' ? 'gap-3.5' : 'gap-2.5'">
      <div
        class="flex shrink-0 items-center justify-center rounded-lg bg-red-600 font-bold text-white shadow-sm"
        [class]="size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-9 w-9 text-base'"
      >
        C
      </div>
      <div class="flex flex-col leading-none">
        <span
          class="font-bold tracking-tight"
          [class]="size === 'lg' ? 'text-3xl' : 'text-lg'"
          [class.text-white]="theme === 'dark'"
          [class.text-slate-900]="theme === 'light'"
        >
          Cogni<span class="text-red-600">tive</span>
        </span>
        <span
          class="font-medium uppercase tracking-widest"
          [class]="size === 'lg' ? 'mt-1.5 text-xs' : 'text-[10px]'"
          [class.text-white/60]="theme === 'dark'"
          [class.text-slate-400]="theme === 'light'"
        >
          RAG Engine
        </span>
      </div>
    </div>
  `,
})
export class LogoComponent {
  @Input() size: 'sm' | 'lg' = 'sm';
  @Input() theme: 'light' | 'dark' = 'light';
}
