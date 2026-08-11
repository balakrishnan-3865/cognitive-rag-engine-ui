import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/api/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-blue-100">
        <div class="h-full w-1/3 bg-blue-600 animate-[loading-bar_1s_ease-in-out_infinite]"></div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes loading-bar {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(300%);
        }
      }
    `,
  ],
})
export class LoadingBarComponent {
  protected readonly loadingService = inject(LoadingService);
}
