export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  [TodoPriority.LOW]: 'Low',
  [TodoPriority.MEDIUM]: 'Medium',
  [TodoPriority.HIGH]: 'High',
  [TodoPriority.URGENT]: 'Urgent',
};
