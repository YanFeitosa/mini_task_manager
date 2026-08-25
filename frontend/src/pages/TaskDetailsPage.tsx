import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Clock3,
  LoaderCircle,
  Pencil,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useAuth } from '../features/auth/authContext'
import {
  formatDate,
  getTaskStatusLabel,
  getTaskStatusTone,
  PRIORITY_LABELS,
} from '../features/tasks/taskPresentation'
import { deleteTask, getTask, type Task } from '../features/tasks/tasksApi'
import { ApiError } from '../services/api'
import './TaskPages.css'

export function TaskDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { token, expireSession } = useAuth()
  const taskId = Number(id)
  const invalidTaskId = !Number.isInteger(taskId) || taskId <= 0
  const notice = (location.state as { notice?: string } | null)?.notice
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(!invalidTaskId)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    invalidTaskId ? 'Tarefa não encontrada.' : null,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!token) {
      return
    }

    if (invalidTaskId) {
      return
    }

    const controller = new AbortController()
    getTask(token, taskId, controller.signal)
      .then(setTask)
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          expireSession()
          return
        }
        if (error instanceof ApiError && error.status === 404) {
          setErrorMessage('Tarefa não encontrada ou sem acesso para este usuário.')
          return
        }
        setErrorMessage('Não foi possível carregar a tarefa. Tente novamente.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [expireSession, invalidTaskId, reloadKey, taskId, token])

  async function handleDelete() {
    if (!token || !task) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteTask(token, task.id)
      navigate('/tasks', { replace: true, state: { notice: 'Tarefa excluída com sucesso.' } })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        expireSession()
      } else {
        setDeleteError('Não foi possível excluir a tarefa. Tente novamente.')
      }
      setIsDeleting(false)
    }
  }

  function reload() {
    setErrorMessage(null)
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  return (
    <main className="task-page task-page--details">
      <button className="task-page__back" type="button" onClick={() => navigate('/tasks')}>
        <ArrowLeft size={17} aria-hidden="true" />
        Voltar para tarefas
      </button>

      {isLoading ? (
        <section className="task-page__card">
          <div className="task-page-state">
            <LoaderCircle className="spinning" size={25} aria-hidden="true" />
            <strong>Carregando tarefa...</strong>
          </div>
        </section>
      ) : errorMessage || !task ? (
        <section className="task-page__card">
          <div className="task-page-state task-page-state--error" role="alert">
            <CircleAlert size={25} aria-hidden="true" />
            <strong>{errorMessage ?? 'Não foi possível carregar esta tarefa.'}</strong>
            {!invalidTaskId && (
              <button type="button" onClick={reload}>
                Tentar novamente
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="task-detail-heading">
            <div>
              <p className="eyebrow">Detalhes da tarefa</p>
              <h1>{task.title}</h1>
              <p>{task.team.name}</p>
            </div>
            <button type="button" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
              <Pencil size={17} aria-hidden="true" />
              Editar
            </button>
          </div>

          {notice && <div className="task-page__notice">{notice}</div>}

          <section className="task-page__card task-detail">
            <div className="task-detail__badges">
              <span className={`task-detail__status task-detail__status--${getTaskStatusTone(task)}`}>
                {getTaskStatusLabel(task)}
              </span>
              <span className={`task-detail__priority task-detail__priority--${task.priority.toLowerCase()}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>

            <div className="task-detail__description">
              <h2>Descrição</h2>
              <p>{task.description || 'Nenhuma descrição informada.'}</p>
            </div>

            <dl className="task-detail__metadata">
              <div>
                <dt><UsersRound size={17} aria-hidden="true" /> Time</dt>
                <dd>{task.team.name}</dd>
              </div>
              <div>
                <dt><UserRound size={17} aria-hidden="true" /> Responsável</dt>
                <dd className={task.assignee ? undefined : 'task-detail__unassigned'}>
                  {task.assignee?.name ?? 'Não atribuído'}
                </dd>
              </div>
              <div>
                <dt><CalendarDays size={17} aria-hidden="true" /> Prazo</dt>
                <dd>{task.dueDate ? formatDate(task.dueDate) : 'Sem prazo'}</dd>
              </div>
              <div>
                <dt><Clock3 size={17} aria-hidden="true" /> Criada em</dt>
                <dd>{formatCreatedAt(task.createdAt)}</dd>
              </div>
            </dl>

            <div className="task-detail__danger">
              {deleteError && <p role="alert">{deleteError}</p>}
              {confirmingDelete ? (
                <div className="task-delete-confirmation" role="alertdialog" aria-labelledby="delete-title">
                  <div>
                    <strong id="delete-title">Excluir esta tarefa?</strong>
                    <span>Esta ação não poderá ser desfeita.</span>
                  </div>
                  <div>
                    <button type="button" disabled={isDeleting} onClick={() => setConfirmingDelete(false)}>
                      Cancelar
                    </button>
                    <button className="task-delete-confirmation__confirm" type="button" disabled={isDeleting} onClick={handleDelete}>
                      {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="task-delete-button" type="button" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 size={16} aria-hidden="true" />
                  Excluir tarefa
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
