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

type Team = {
  id: number
  name: string
  createdAt: string
  members: TeamMember[]
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

export async function getTeamMembers(accessToken: string, signal?: AbortSignal) {
  const teams = await authenticatedApiRequest<Team[]>('/teams', accessToken, { signal })
  const membersById = new Map<number, TeamMember>()

  teams.forEach((team) => {
    team.members.forEach((member) => membersById.set(member.id, member))
  })

  return [...membersById.values()].sort((first, second) =>
    first.name.localeCompare(second.name, 'pt-BR'),
  )
}

export function updateTaskStatus(accessToken: string, task: Task, status: TaskStatus) {
  return authenticatedApiRequest<Task>(`/tasks/${task.id}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status,
      priority: task.priority,
      assigneeId: task.assignee?.id ?? null,
      teamId: task.team.id,
      dueDate: task.dueDate,
    }),
  })
}
