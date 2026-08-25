import { authenticatedApiRequest } from '../../services/api'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type Task = {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee: TeamMember | null
  team: {
    id: number
    name: string
  }
  createdAt: string
  dueDate: string | null
}

export type TeamMember = {
  id: number
  name: string
  email: string
}

export type Team = {
  id: number
  name: string
  createdAt: string
  members: TeamMember[]
}

export type TaskPayload = {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: number | null
  teamId: number
  dueDate: string | null
}

export type TaskPage = {
  content: Task[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type TaskFilters = {
  status: TaskStatus | ''
  priority: TaskPriority | ''
  assigneeId: string
}

const PAGE_SIZE = 5

export function getTasks(
  accessToken: string,
  filters: TaskFilters,
  page: number,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
    sort: 'createdAt,desc',
  })

  if (filters.status) {
    params.set('status', filters.status)
  }
  if (filters.priority) {
    params.set('priority', filters.priority)
  }
  if (filters.assigneeId) {
    params.set('assigneeId', filters.assigneeId)
  }

  return authenticatedApiRequest<TaskPage>(`/tasks?${params}`, accessToken, { signal })
}

export function getTask(accessToken: string, taskId: number, signal?: AbortSignal) {
  return authenticatedApiRequest<Task>(`/tasks/${taskId}`, accessToken, { signal })
}

export function getTeams(accessToken: string, signal?: AbortSignal) {
  return authenticatedApiRequest<Team[]>('/teams', accessToken, { signal })
}

export async function getTeamMembers(accessToken: string, signal?: AbortSignal) {
  const teams = await getTeams(accessToken, signal)
  const membersById = new Map<number, TeamMember>()

  teams.forEach((team) => {
    team.members.forEach((member) => membersById.set(member.id, member))
  })

  return [...membersById.values()].sort((first, second) =>
    first.name.localeCompare(second.name, 'pt-BR'),
  )
}

export function createTask(accessToken: string, payload: TaskPayload) {
  return authenticatedApiRequest<Task>('/tasks', accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(accessToken: string, taskId: number, payload: TaskPayload) {
  return authenticatedApiRequest<Task>(`/tasks/${taskId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(accessToken: string, taskId: number) {
  return authenticatedApiRequest<void>(`/tasks/${taskId}`, accessToken, { method: 'DELETE' })
}

export function updateTaskStatus(accessToken: string, task: Task, status: TaskStatus) {
  return updateTask(accessToken, task.id, {
    title: task.title,
    description: task.description,
    status,
    priority: task.priority,
    assigneeId: task.assignee?.id ?? null,
    teamId: task.team.id,
    dueDate: task.dueDate,
  })
}
