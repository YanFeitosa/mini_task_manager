import type { Task, TaskPriority, TaskStatus } from './tasksApi'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function getStatusTone(status: TaskStatus) {
  return {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
  }[status] as 'todo' | 'in-progress' | 'completed'
}

export function getTaskStatusLabel(task: Task) {
  return task.overdue ? 'Pendente' : STATUS_LABELS[task.status]
}

export function getTaskStatusTone(task: Task) {
  return task.overdue ? 'pending' : getStatusTone(task.status)
}

export function getTaskStatusOptions(task: Task) {
  if (!task.overdue) {
    return STATUS_OPTIONS
  }

  return STATUS_OPTIONS.map((option) =>
    option.value === 'TODO' ? { ...option, label: 'Pendente' } : option,
  )
}

export function isPastDueDate(dueDate: string | null) {
  if (!dueDate) {
    return false
  }

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return dueDate < today
}
