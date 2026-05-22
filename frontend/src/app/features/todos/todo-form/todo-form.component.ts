import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppRoute } from '../../../core/enums/app-route.enum';
import {
  TODO_PRIORITY_LABELS,
  TodoPriority,
} from '../../../core/enums/todo-priority.enum';
import {
  TODO_STATUS_LABELS,
  TodoStatus,
} from '../../../core/enums/todo-status.enum';
import {
  CreateTodoPayload,
  Todo,
  UpdateTodoPayload,
} from '../../../core/models/todo.model';
import { TodoService } from '../../../core/services/todo.service';
import { extractApiErrorMessage } from '../../../core/utils/api-error.util';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './todo-form.component.html',
})
export class TodoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly todoService = inject(TodoService);

  readonly appRoute = AppRoute;
  readonly statusOptions = Object.values(TodoStatus);
  readonly priorityOptions = Object.values(TodoPriority);
  readonly statusLabels = TODO_STATUS_LABELS;
  readonly priorityLabels = TODO_PRIORITY_LABELS;

  readonly editId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form: FormGroup = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    status: [TodoStatus.PENDING, [Validators.required]],
    priority: [TodoPriority.MEDIUM, [Validators.required]],
    dueDate: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loadTodo(id);
    }
  }

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload = this.buildPayload();
    const editId = this.editId();
    const request$ = editId
      ? this.todoService.update(editId, payload)
      : this.todoService.create(payload as CreateTodoPayload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate([`/${AppRoute.Dashboard}`]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not save the todo.'));
      },
    });
  }

  private buildPayload(): CreateTodoPayload | UpdateTodoPayload {
    const value = this.form.getRawValue();
    const payload: CreateTodoPayload = {
      title: value.title.trim(),
      status: value.status,
      priority: value.priority,
    };
    if (value.description?.trim()) {
      payload.description = value.description.trim();
    }
    if (value.dueDate) {
      payload.dueDate = new Date(value.dueDate).toISOString();
    }
    return payload;
  }

  private loadTodo(id: string): void {
    this.loading.set(true);
    this.todoService.get(id).subscribe({
      next: (todo) => this.populateForm(todo),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(extractApiErrorMessage(err, 'Could not load the todo.'));
      },
    });
  }

  private populateForm(todo: Todo): void {
    this.form.patchValue({
      title: todo.title,
      description: todo.description ?? '',
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.substring(0, 10) : '',
    });
    this.loading.set(false);
  }
}
