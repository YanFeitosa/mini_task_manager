import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  ClipboardList,
  Rows3,
  LoaderCircle,
  LogOut,
  SlidersHorizontal,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { AppBrand } from '../components/AppBrand'
import { Select } from '../components/Select'
import { useAuth } from '../features/auth/authContext'
import { TaskList } from '../features/tasks/TaskList'
import {
  getTasks,
  getTeamMembers,
  updateTaskStatus,
  type Task,
  type TaskFilters,
  type TaskPage,
  type TaskStatus,
  type TeamMember,
} from '../features/tasks/tasksApi'
import { ApiError } from '../services/api'
import './TasksPage.css'

const EMPTY_FILTERS: TaskFilters = {
  status: '',
  priority: '',
  assigneeId: '',
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'TODO', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluída' },
]

const PRIORITY_FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]

type TaskView = 'all' | 'mine'

export function TasksPage() {
  const navigate = useNavigate()
  const { token, userId, userName, logout, expireSession } = useAuth()
  const [view, setView] = useState<TaskView>('all')
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [taskPage, setTaskPage] = useState<TaskPage | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersUnavailable, setMembersUnavailable] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!token) {
      return
    }

    const controller = new AbortController()

    getTeamMembers(token, controller.signal)
      .then(setMembers)
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          expireSession()
          return
        }
        setMembersUnavailable(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMembersLoading(false)
        }
      })

    return () => controller.abort()
  }, [expireSession, token])

  useEffect(() => {
    if (!token) {
      return
    }

    const controller = new AbortController()

    getTasks(token, filters, page, controller.signal)
      .then(setTaskPage)
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          expireSession()
          return
        }
        setErrorMessage('Não foi possível carregar as tarefas. Tente novamente.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [expireSession, filters, page, reloadKey, token])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleFilterChange(name: keyof TaskFilters, value: string) {
    startLoading()
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(0)
  }

  function changeView(nextView: TaskView) {
    if (nextView === view || (nextView === 'mine' && !userId)) {
      return
    }

    startLoading()
    setView(nextView)
    setFilters((current) => ({
      ...current,
      assigneeId: nextView === 'mine' ? String(userId) : '',
    }))
    setPage(0)
  }

  function clearFilters() {
    startLoading()
    setFilters({
      ...EMPTY_FILTERS,
      assigneeId: view === 'mine' && userId ? String(userId) : '',
    })
    setPage(0)
  }

  function changePage(nextPage: number) {
    startLoading()
    setPage(nextPage)
  }

  function reloadTasks() {
    startLoading()
    setReloadKey((current) => current + 1)
  }

  function startLoading() {
    setIsLoading(true)
    setErrorMessage(null)
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    if (!token || status === task.status || updatingTaskId !== null) {
      return
    }

    setStatusError(null)
    setUpdatingTaskId(task.id)
    replaceTask({ ...task, status })

    try {
      const updatedTask = await updateTaskStatus(token, task, status)
      replaceTask(updatedTask)

      if (filters.status && filters.status !== updatedTask.status) {
        startLoading()
        setReloadKey((current) => current + 1)
      }
    } catch (error) {
      replaceTask(task)

      if (error instanceof ApiError && error.status === 401) {
        expireSession()
      } else if (error instanceof ApiError && error.status === 422) {
        setStatusError('Defina um responsável antes de concluir esta tarefa.')
      } else {
        setStatusError('Não foi possível alterar o status da tarefa. Tente novamente.')
      }
    } finally {
      setUpdatingTaskId(null)
    }
  }

  function replaceTask(task: Task) {
    setTaskPage((current) =>
      current
        ? {
            ...current,
            content: current.content.map((item) => (item.id === task.id ? task : item)),
          }
        : current,
    )
  }

  const hasActiveFilters = Boolean(
    filters.status || filters.priority || (view === 'all' && filters.assigneeId),
  )
  const tasks = taskPage?.content ?? []
  const responsibleOptions = [
    {
      value: '',
      label: membersLoading ? 'Carregando...' : membersUnavailable ? 'Indisponível' : 'Todos',
    },
    ...(view === 'mine' && userId && !members.some((member) => member.id === userId)
      ? [{ value: String(userId), label: userName ?? 'Usuário' }]
      : []),
    ...members.map((member) => ({ value: String(member.id), label: member.name })),
  ]

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div className="tasks-header__content">
          <AppBrand />

          <div className="tasks-header__actions">
            <div className="user-summary">
              <CircleUserRound size={20} aria-hidden="true" />
              <span>
                <small>Conectado como</small>
                <strong>{userName ?? 'Usuário'}</strong>
              </span>
            </div>
            <button className="logout-button" type="button" onClick={handleLogout}>
              <LogOut size={18} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="tasks-content">
        <div className="tasks-heading">
          <div>
            <p className="eyebrow">Visão geral</p>
            <h1>Tarefas</h1>
            <p>Acompanhe as demandas dos seus times em um só lugar.</p>
          </div>
        </div>

        <nav className="task-views" aria-label="Visualização das tarefas">
          <button
            className={view === 'all' ? 'task-view task-view--active' : 'task-view'}
            type="button"
            aria-pressed={view === 'all'}
            onClick={() => changeView('all')}
          >
            <Rows3 size={17} aria-hidden="true" />
            Todas as tarefas
          </button>
          <button
            className={view === 'mine' ? 'task-view task-view--active' : 'task-view'}
            type="button"
            aria-pressed={view === 'mine'}
            disabled={!userId}
            onClick={() => changeView('mine')}
          >
            <UserRoundCheck size={17} aria-hidden="true" />
            Minhas atividades
          </button>
        </nav>

        {statusError && (
          <div className="tasks-feedback" role="alert">
            <CircleAlert size={19} aria-hidden="true" />
            <span>{statusError}</span>
            <button type="button" aria-label="Fechar mensagem" onClick={() => setStatusError(null)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <section className="task-filters" aria-labelledby="filters-title">
          <div className="task-filters__heading">
            <h2 id="filters-title">
              <SlidersHorizontal size={18} aria-hidden="true" />
              Filtros
            </h2>
            {hasActiveFilters && (
              <button className="clear-filters" type="button" onClick={clearFilters}>
                <X size={16} aria-hidden="true" />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="task-filters__fields">
            <label>
              <span>Status</span>
              <Select
                ariaLabel="Filtrar por status"
                value={filters.status}
                options={STATUS_FILTER_OPTIONS}
                onChange={(value) => handleFilterChange('status', value)}
              />
            </label>

            <label>
              <span>Prioridade</span>
              <Select
                ariaLabel="Filtrar por prioridade"
                value={filters.priority}
                options={PRIORITY_FILTER_OPTIONS}
                onChange={(value) => handleFilterChange('priority', value)}
              />
            </label>

            <label>
              <span>Responsável</span>
              <Select
                ariaLabel="Filtrar por responsável"
                value={filters.assigneeId}
                options={responsibleOptions}
                onChange={(value) => handleFilterChange('assigneeId', value)}
                disabled={view === 'mine' || membersLoading || membersUnavailable}
              />
            </label>
          </div>
        </section>

        <section className="task-panel" aria-labelledby="task-list-title">
          <div className="task-panel__heading">
            <div>
              <h2 id="task-list-title">Lista de tarefas</h2>
              {!isLoading && !errorMessage && taskPage && (
                <p>{formatTaskCount(taskPage.totalElements)}</p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="task-state" role="status">
              <LoaderCircle className="spinning" size={25} aria-hidden="true" />
              <strong>Carregando tarefas...</strong>
            </div>
          ) : errorMessage ? (
            <div className="task-state task-state--error" role="alert">
              <CircleAlert size={26} aria-hidden="true" />
              <strong>{errorMessage}</strong>
              <button type="button" onClick={reloadTasks}>
                Tentar novamente
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="task-state">
              <ClipboardList size={28} aria-hidden="true" />
              <strong>Nenhuma tarefa encontrada</strong>
              <span>
                {hasActiveFilters
                  ? 'Altere ou limpe os filtros para ver outras tarefas.'
                  : 'As tarefas dos seus times aparecerão aqui.'}
              </span>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              updatingTaskId={updatingTaskId}
              onStatusChange={handleStatusChange}
            />
          )}

          {!isLoading && !errorMessage && taskPage && taskPage.totalPages > 1 && (
            <nav className="task-pagination" aria-label="Paginação das tarefas">
              <button
                type="button"
                disabled={taskPage.page === 0}
                onClick={() => changePage(taskPage.page - 1)}
              >
                <ChevronLeft size={17} aria-hidden="true" />
                <span>Anterior</span>
              </button>
              <span>
                Página <strong>{taskPage.page + 1}</strong> de {taskPage.totalPages}
              </span>
              <button
                type="button"
                disabled={taskPage.page + 1 >= taskPage.totalPages}
                onClick={() => changePage(taskPage.page + 1)}
              >
                <span>Próxima</span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </main>
    </div>
  )
}

function formatTaskCount(total: number) {
  return `${total} ${total === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}`
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
