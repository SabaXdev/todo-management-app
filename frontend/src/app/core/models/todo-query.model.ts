import { SortOrder } from '../enums/sort-order.enum';
import { TodoPriority } from '../enums/todo-priority.enum';
import { TodoSortBy } from '../enums/todo-sort-by.enum';
import { TodoStatus } from '../enums/todo-status.enum';

export interface TodoQuery {
  status?: TodoStatus | '';
  priority?: TodoPriority | '';
  search?: string;
  sortBy?: TodoSortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}
