import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  TODO_PRIORITY_LABELS,
  TodoPriority,
} from '../../../core/enums/todo-priority.enum';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [ngClass]="priorityClasses[priority]">
      {{ labels[priority] }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: TodoPriority;

  readonly labels = TODO_PRIORITY_LABELS;
  readonly priorityClasses: Record<TodoPriority, string> = {
    [TodoPriority.LOW]: 'bg-slate-100 text-slate-600 ring-slate-300',
    [TodoPriority.MEDIUM]: 'bg-sky-100 text-sky-700 ring-sky-300',
    [TodoPriority.HIGH]: 'bg-orange-100 text-orange-700 ring-orange-300',
    [TodoPriority.URGENT]: 'bg-rose-100 text-rose-700 ring-rose-300',
  };
}
