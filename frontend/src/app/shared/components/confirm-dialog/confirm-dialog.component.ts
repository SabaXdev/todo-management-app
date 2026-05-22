import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      (click)="onBackdrop($event)"
    >
      <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
        <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
        <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="btn-secondary" (click)="cancel.emit()">
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            [class]="dangerous ? 'btn-danger' : 'btn-primary'"
            (click)="confirm.emit()"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() dangerous = false;

  @Output() readonly confirm = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
