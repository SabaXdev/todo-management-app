import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  TODO_STATUS_LABELS,
  TodoStatus,
} from '../../../core/enums/todo-status.enum';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [ngClass]="statusClasses[status]">
      {{ labels[status] }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: TodoStatus;

  readonly labels = TODO_STATUS_LABELS;
  readonly statusClasses: Record<TodoStatus, string> = {
    [TodoStatus.PENDING]: 'bg-slate-100 text-slate-700 ring-slate-300',
    [TodoStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-800 ring-amber-300',
    [TodoStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
    [TodoStatus.ARCHIVED]: 'bg-zinc-200 text-zinc-700 ring-zinc-400',
  };
}
