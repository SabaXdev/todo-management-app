export enum TodoStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  [TodoStatus.PENDING]: 'Pending',
  [TodoStatus.IN_PROGRESS]: 'In progress',
  [TodoStatus.COMPLETED]: 'Completed',
  [TodoStatus.ARCHIVED]: 'Archived',
};
