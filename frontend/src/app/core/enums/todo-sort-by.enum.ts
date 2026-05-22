export enum TodoSortBy {
  CREATED_AT = 'createdAt',
  DUE_DATE = 'dueDate',
  UPDATED_AT = 'updatedAt',
}

export const TODO_SORT_BY_LABELS: Record<TodoSortBy, string> = {
  [TodoSortBy.CREATED_AT]: 'Created date',
  [TodoSortBy.DUE_DATE]: 'Due date',
  [TodoSortBy.UPDATED_AT]: 'Updated date',
};
