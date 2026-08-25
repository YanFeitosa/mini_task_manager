import { ArrowLeft, CircleAlert, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { TaskForm, type TaskFormValues } from '../features/tasks/TaskForm'
import {
  createTask,
  getTask,
  getTeams,
  updateTask,
  type Task,
  type TaskPayload,
  type Team,
} from '../features/tasks/tasksApi'
import { useAuth } from '../features/auth/authContext'
import { ApiError } from '../services/api'
import './TaskPages.css'

type TaskFormPageProps = {
  mode: 'create' | 'edit'
}

const EMPTY_VALUES: TaskFormValues = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  teamId: '',
  assigneeId: '',
  dueDate: '',
}

export function TaskFormPage({ mode }: TaskFormPageProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token, expireSession } = useAuth()
  const taskId = mode === 'edit' ? Number(id) : null
  const invalidTaskId = mode === 'edit' && (!Number.isInteger(taskId) || Number(taskId) <= 0)
  const [teams, setTeams] = useState<Team[]>([])
  const [initialValues, setInitialValues] = useState<TaskFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(!invalidTaskId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(
    invalidTaskId ? 'Tarefa não encontrada.' : null,
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!token) {
      return
    }

    if (invalidTaskId) {
      return
    }

    const controller = new AbortController()
    const taskRequest =
      mode === 'edit' ? getTask(token, Number(taskId), controller.signal) : Promise.resolve(null)

    Promise.all([getTeams(token, controller.signal), taskRequest])
      .then(([loadedTeams, task]) => {
        setTeams(loadedTeams)
        setInitialValues(task ? valuesFromTask(task) : EMPTY_VALUES)
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          expireSession()
          return
        }
        if (error instanceof ApiError && error.status === 404) {
          setLoadError('Tarefa não encontrada ou sem acesso para este usuário.')
          return
        }
        setLoadError('Não foi possível carregar os dados necessários. Tente novamente.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [expireSession, invalidTaskId, mode, reloadKey, taskId, token])

  async function handleSubmit(payload: TaskPayload) {
    if (!token) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const savedTask =
        mode === 'create'
          ? await createTask(token, payload)
          : await updateTask(token, Number(taskId), payload)
      navigate(`/tasks/${savedTask.id}`, {
        replace: true,
        state: {
          notice: mode === 'create' ? 'Tarefa criada com sucesso.' : 'Tarefa atualizada com sucesso.',
        },
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        expireSession()
      } else if (error instanceof ApiError && error.status === 422) {
        setSubmitError('Verifique se o responsável pertence ao time selecionado.')
      } else {
        setSubmitError('Não foi possível salvar a tarefa. Revise os dados e tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    navigate(mode === 'edit' && taskId ? `/tasks/${taskId}` : '/tasks')
  }

  function reload() {
    setLoadError(null)
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  return (
    <main className="task-page">
      <button className="task-page__back" type="button" onClick={handleCancel}>
        <ArrowLeft size={17} aria-hidden="true" />
        {mode === 'edit' ? 'Voltar aos detalhes' : 'Voltar para tarefas'}
      </button>

      <div className="task-page__heading">
        <p className="eyebrow">{mode === 'create' ? 'Nova demanda' : 'Editar tarefa'}</p>
        <h1>{mode === 'create' ? 'Criar tarefa' : 'Atualizar tarefa'}</h1>
        <p>
          {mode === 'create'
            ? 'Registre uma demanda e defina como ela será acompanhada pelo time.'
            : 'Revise as informações e salve somente o que precisa ser alterado.'}
        </p>
      </div>

      <section className="task-page__card" aria-label="Dados da tarefa">
        {isLoading ? (
          <PageState icon={<LoaderCircle className="spinning" size={25} />}>
            Carregando dados...
          </PageState>
        ) : loadError || !initialValues ? (
          <PageState icon={<CircleAlert size={25} />} error>
            {loadError ?? 'Não foi possível carregar esta tarefa.'}
            {!invalidTaskId && (
              <button type="button" onClick={reload}>
                Tentar novamente
              </button>
            )}
          </PageState>
        ) : (
          <TaskForm
            initialValues={initialValues}
            teams={teams}
            submitLabel={mode === 'create' ? 'Criar tarefa' : 'Salvar alterações'}
            isSubmitting={isSubmitting}
            serverError={submitError}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </section>
    </main>
  )
}

function valuesFromTask(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    teamId: String(task.team.id),
    assigneeId: task.assignee ? String(task.assignee.id) : '',
    dueDate: task.dueDate ?? '',
  }
}

function PageState({
  icon,
  error = false,
  children,
}: {
  icon: React.ReactNode
  error?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={error ? 'task-page-state task-page-state--error' : 'task-page-state'}>
      {icon}
      <strong>{children}</strong>
    </div>
  )
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
