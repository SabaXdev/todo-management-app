import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { AppRoute } from '../../../core/enums/app-route.enum';
import { SortOrder } from '../../../core/enums/sort-order.enum';
import {
  TODO_PRIORITY_LABELS,
  TodoPriority,
} from '../../../core/enums/todo-priority.enum';
import {
  TODO_SORT_BY_LABELS,
  TodoSortBy,
} from '../../../core/enums/todo-sort-by.enum';
import {
  TODO_STATUS_LABELS,
  TodoStatus,
} from '../../../core/enums/todo-status.enum';
import { PaginatedTodos, Todo } from '../../../core/models/todo.model';
import { TodoQuery } from '../../../core/models/todo-query.model';
import { TodoService } from '../../../core/services/todo.service';
import { extractApiErrorMessage } from '../../../core/utils/api-error.util';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  private readonly todoService = inject(TodoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly appRoute = AppRoute;
  readonly statusOptions = Object.values(TodoStatus);
  readonly priorityOptions = Object.values(TodoPriority);
  readonly sortByOptions = Object.values(TodoSortBy);
  readonly statusLabels = TODO_STATUS_LABELS;
  readonly priorityLabels = TODO_PRIORITY_LABELS;
  readonly sortByLabels = TODO_SORT_BY_LABELS;
  readonly sortOrder = SortOrder;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly todos = signal<Todo[]>([]);
  readonly total = signal(0);
  readonly todoToDelete = signal<Todo | null>(null);
  readonly deleting = signal(false);

  readonly filterForm: FormGroup = this.fb.nonNullable.group({
    search: [''],
    status: [''],
    priority: [''],
    sortBy: [TodoSortBy.CREATED_AT],
    sortOrder: [SortOrder.DESC],
  });

  private readonly reload$ = new Subject<TodoQuery>();

  constructor() {
    this.reload$
      .pipe(
        switchMap((query) =>
          this.todoService.list(query).pipe(
            catchError((err) => {
              this.handleError(err);
              return of(null);
            }),
          ),
        ),
      )
      .subscribe((paginated) => {
        if (paginated) {
          this.handleSuccess(paginated);
        }
      });

    this.filterForm.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => this.reload());

    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filterForm.getRawValue() as TodoQuery;
    this.reload$.next(value);
  }

  askDelete(todo: Todo): void {
    this.todoToDelete.set(todo);
  }

  cancelDelete(): void {
    this.todoToDelete.set(null);
  }

  confirmDelete(): void {
    const todo = this.todoToDelete();
    if (!todo || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.todoService.remove(todo.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.todoToDelete.set(null);
        this.reload();
      },
      error: (err) => {
        this.deleting.set(false);
        this.todoToDelete.set(null);
        this.errorMessage.set(extractApiErrorMessage(err));
      },
    });
  }

  edit(todo: Todo): void {
    this.router.navigate([`/${AppRoute.Todos}`, todo.id]);
  }

  trackById(_index: number, todo: Todo): string {
    return todo.id;
  }

  private handleSuccess(paginated: PaginatedTodos): void {
    this.loading.set(false);
    this.todos.set(paginated.items);
    this.total.set(paginated.total);
  }

  private handleError(err: unknown): void {
    this.loading.set(false);
    this.todos.set([]);
    this.total.set(0);
    this.errorMessage.set(extractApiErrorMessage(err, 'Failed to load todos.'));
  }
}
