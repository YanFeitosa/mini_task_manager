import { CalendarDays, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { Select } from '../../components/Select'
import {
  formatDate,
  getTaskStatusOptions,
  getTaskStatusTone,
  PRIORITY_LABELS,
} from './taskPresentation'
import type { Task, TaskStatus } from './tasksApi'

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
            <Link to={`/tasks/${task.id}`}>
              <strong>{task.title}</strong>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
            <span>{task.team.name}</span>
          </div>

          <div className="task-row__field task-row__field--center">
            <span className="task-row__mobile-label">Status</span>
            <Select
              compact
              tone={getTaskStatusTone(task)}
              value={task.status}
              options={getTaskStatusOptions(task)}
              ariaLabel={`Status da tarefa ${task.title}`}
              disabled={updatingTaskId !== null}
              onChange={(value) => onStatusChange(task, value as TaskStatus)}
            />
          </div>

          <div className="task-row__field task-row__field--center">
            <span className="task-row__mobile-label">Prioridade</span>
            <span className={`priority-badge priority-badge--${task.priority.toLowerCase()}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          <div className="task-row__field task-row__field--center task-assignee">
            <span className="task-row__mobile-label">Responsável</span>
            <span className={task.assignee ? undefined : 'task-assignee--unassigned'}>
              {task.assignee?.name ?? 'Não atribuído'}
            </span>
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
