import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center py-12" role="status" aria-live="polite">
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"
      ></div>
      @if (label) {
        <span class="ml-3 text-sm text-slate-500">{{ label }}</span>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() label = '';
}
