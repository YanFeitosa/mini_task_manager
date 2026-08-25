import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import './DatePicker.css'

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function DatePicker({
  value,
  onChange,
  ariaLabel,
  placeholder = 'Selecione uma data',
  disabled = false,
}: DatePickerProps) {
  const selectedDate = parseDate(value)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate ?? new Date()))
  const rootRef = useRef<HTMLDivElement>(null)
  const dialogId = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  function toggleCalendar() {
    if (disabled) {
      return
    }

    if (!isOpen) {
      setVisibleMonth(startOfMonth(selectedDate ?? new Date()))
    }
    setIsOpen((current) => !current)
  }

  function changeMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    )
  }

  function selectDay(day: number) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
    onChange(toDateValue(date))
    setIsOpen(false)
  }

  function selectToday() {
    onChange(toDateValue(new Date()))
    setIsOpen(false)
  }

  function clearDate() {
    onChange('')
    setIsOpen(false)
  }

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const numberOfDays = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const days = Array.from({ length: numberOfDays }, (_, index) => index + 1)

  return (
    <div className={disabled ? 'date-picker date-picker--disabled' : 'date-picker'} ref={rootRef}>
      <button
        className="date-picker__trigger"
        type="button"
        aria-label={ariaLabel}
        aria-controls={dialogId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={toggleCalendar}
      >
        <span className={value ? '' : 'date-picker__placeholder'}>
          {selectedDate ? formatSelectedDate(selectedDate) : placeholder}
        </span>
        <CalendarDays size={17} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="date-picker__calendar"
          id={dialogId}
          role="dialog"
          aria-label="Escolher data"
        >
          <div className="date-picker__month-navigation">
            <button type="button" aria-label="Mês anterior" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <strong aria-live="polite">{formatMonth(visibleMonth)}</strong>
            <button type="button" aria-label="Próximo mês" onClick={() => changeMonth(1)}>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="date-picker__weekdays" aria-hidden="true">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="date-picker__days">
            {days.map((day) => {
              const date = new Date(year, month, day)
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
              const isToday = isSameDay(date, new Date())

              return (
                <button
                  className={[
                    isSelected ? 'date-picker__day--selected' : '',
                    isToday ? 'date-picker__day--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={day}
                  type="button"
                  aria-label={formatAccessibleDate(date)}
                  aria-pressed={isSelected}
                  style={day === 1 ? { gridColumnStart: firstWeekday + 1 } : undefined}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="date-picker__actions">
            {value && (
              <button type="button" onClick={clearDate}>
                <X size={14} aria-hidden="true" />
                Limpar
              </button>
            )}
            <button type="button" onClick={selectToday}>Hoje</button>
          </div>
        </div>
      )}
    </div>
  )
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function toDateValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
}

function formatAccessibleDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
