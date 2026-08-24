import { CircleAlert, Save } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { DatePicker } from '../../components/DatePicker'
import { Select } from '../../components/Select'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './taskPresentation'
import type { TaskPayload, TaskPriority, TaskStatus, Team } from './tasksApi'
import './TaskForm.css'

export type TaskFormValues = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  teamId: string
  assigneeId: string
  dueDate: string
}

type TaskFormProps = {
  initialValues: TaskFormValues
  teams: Team[]
  submitLabel: string
  isSubmitting: boolean
  serverError: string | null
  onSubmit: (payload: TaskPayload) => void
  onCancel: () => void
}

type FormErrors = Partial<Record<keyof TaskFormValues, string>>

export function TaskForm({
  initialValues,
  teams,
  submitLabel,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const selectedTeam = teams.find((team) => String(team.id) === values.teamId)
  const teamOptions = [
    { value: '', label: teams.length === 0 ? 'Nenhum time disponível' : 'Selecione um time' },
    ...teams.map((team) => ({ value: String(team.id), label: team.name })),
  ]
  const assigneeOptions = [
    {
      value: '',
      label: selectedTeam ? 'Sem responsável' : 'Selecione um time primeiro',
    },
    ...(selectedTeam?.members.map((member) => ({
      value: String(member.id),
      label: member.name,
    })) ?? []),
  ]

  function handleTextChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as keyof TaskFormValues
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSelectChange(field: keyof TaskFormValues, value: string) {
    setValues((current) => {
      if (field !== 'teamId') {
        return { ...current, [field]: value }
      }

      const nextTeam = teams.find((team) => String(team.id) === value)
      const keepsAssignee = nextTeam?.members.some(
        (member) => String(member.id) === current.assigneeId,
      )
      return {
        ...current,
        teamId: value,
        assigneeId: keepsAssignee ? current.assigneeId : '',
      }
    })
    setErrors((current) => ({ ...current, [field]: undefined, assigneeId: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onSubmit({
      title: values.title.trim(),
      description: values.description.trim() || null,
      status: values.status,
      priority: values.priority,
      teamId: Number(values.teamId),
      assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
      dueDate: values.dueDate || null,
    })
  }

  return (
    <form className="task-form" noValidate onSubmit={handleSubmit}>
      {serverError && (
        <div className="task-form__error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="task-form__field task-form__field--full">
        <label htmlFor="task-title">Título</label>
        <input
          id="task-title"
          name="title"
          type="text"
          maxLength={150}
          value={values.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'task-title-error' : undefined}
          onChange={handleTextChange}
        />
        {errors.title && <span id="task-title-error">{errors.title}</span>}
      </div>

      <div className="task-form__field task-form__field--full">
        <label htmlFor="task-description">Descrição</label>
        <textarea
          id="task-description"
          name="description"
          rows={5}
          maxLength={5000}
          value={values.description}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'task-description-error' : undefined}
          onChange={handleTextChange}
        />
        {errors.description && <span id="task-description-error">{errors.description}</span>}
      </div>

      <div className="task-form__field">
        <label>Status</label>
        <Select
          ariaLabel="Status da tarefa"
          value={values.status}
          options={STATUS_OPTIONS}
          onChange={(value) => handleSelectChange('status', value)}
        />
      </div>

      <div className="task-form__field">
        <label>Prioridade</label>
        <Select
          ariaLabel="Prioridade da tarefa"
          value={values.priority}
          options={PRIORITY_OPTIONS}
          onChange={(value) => handleSelectChange('priority', value)}
        />
      </div>

      <div className="task-form__field">
        <label>Time</label>
        <Select
          ariaLabel="Time da tarefa"
          value={values.teamId}
          options={teamOptions}
          disabled={teams.length === 0}
          onChange={(value) => handleSelectChange('teamId', value)}
        />
        {errors.teamId && <span>{errors.teamId}</span>}
      </div>

      <div className="task-form__field">
        <label>Responsável</label>
        <Select
          ariaLabel="Responsável pela tarefa"
          value={values.assigneeId}
          options={assigneeOptions}
          disabled={!selectedTeam}
          onChange={(value) => handleSelectChange('assigneeId', value)}
        />
        {errors.assigneeId && <span>{errors.assigneeId}</span>}
      </div>

      <div className="task-form__field">
        <label>Prazo</label>
        <DatePicker
          ariaLabel="Prazo da tarefa"
          value={values.dueDate}
          placeholder="Selecione um prazo"
          onChange={(value) => handleSelectChange('dueDate', value)}
        />
      </div>

      <div className="task-form__actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button className="task-form__submit" type="submit" disabled={isSubmitting}>
          <Save size={17} aria-hidden="true" />
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function validate(values: TaskFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Informe o título da tarefa.'
  }
  if (values.title.trim().length > 150) {
    errors.title = 'O título deve ter no máximo 150 caracteres.'
  }
  if (values.description.length > 5000) {
    errors.description = 'A descrição deve ter no máximo 5.000 caracteres.'
  }
  if (!values.teamId) {
    errors.teamId = 'Selecione um time.'
  }
  if (values.status === 'COMPLETED' && !values.assigneeId) {
    errors.assigneeId = 'Uma tarefa concluída precisa ter responsável.'
  }

  return errors
}
