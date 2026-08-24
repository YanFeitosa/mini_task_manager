import { CalendarDays } from 'lucide-react'
import { Select } from '../../components/Select'
import type { Task, TaskStatus } from './tasksApi'

const STATUS_LABELS = {
  TODO: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
} as const

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))

const PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
} as const

type TaskListProps = {
  tasks: Task[]
  updatingTaskId: number | null
  onStatusChange: (task: Task, status: TaskStatus) => void
}

export function TaskList({ tasks, updatingTaskId, onStatusChange }: TaskListProps) {
  return (
    <div className="task-list" role="list">
      <div className="task-list__labels" aria-hidden="true">
        <span>Tarefa</span>
        <span>Status</span>
        <span>Prioridade</span>
        <span>Responsável</span>
        <span>Prazo</span>
      </div>

      {tasks.map((task) => (
        <article className="task-row" key={task.id} role="listitem">
          <div className="task-row__main">
            <strong>{task.title}</strong>
            <span>{task.team.name}</span>
          </div>

          <div className="task-row__field">
            <span className="task-row__mobile-label">Status</span>
            <Select
              compact
              tone={getStatusTone(task.status)}
              value={task.status}
              options={STATUS_OPTIONS}
              ariaLabel={`Status da tarefa ${task.title}`}
              disabled={updatingTaskId !== null}
              onChange={(value) => onStatusChange(task, value as TaskStatus)}
            />
          </div>

          <div className="task-row__field">
            <span className="task-row__mobile-label">Prioridade</span>
            <span className={`priority-badge priority-badge--${task.priority.toLowerCase()}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          <div className="task-row__field task-assignee">
            <span className="task-row__mobile-label">Responsável</span>
            <span>{task.assignee?.name ?? 'Não atribuído'}</span>
          </div>

          <div className="task-row__field">
            <span className="task-row__mobile-label">Prazo</span>
            <span className={isTaskOverdue(task) ? 'task-date task-date--overdue' : 'task-date'}>
              <CalendarDays size={15} aria-hidden="true" />
              {task.dueDate ? formatDate(task.dueDate) : 'Sem prazo'}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}

function getStatusTone(status: TaskStatus) {
  return {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
  }[status] as 'todo' | 'in-progress' | 'completed'
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function isTaskOverdue(task: Task) {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false
  }

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  return task.dueDate < today
}
