import { TodoPriority } from '../enums/todo-priority.enum';
import { TodoStatus } from '../enums/todo-status.enum';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTodos {
  items: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
}

export type UpdateTodoPayload = Partial<CreateTodoPayload>;
