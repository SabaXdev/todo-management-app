import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <h3 class="mt-4 text-base font-semibold text-slate-900">{{ title }}</h3>
      @if (description) {
        <p class="mt-1 max-w-md text-sm text-slate-500">{{ description }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() description = '';
}
