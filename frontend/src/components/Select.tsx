import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import './Select.css'

export type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
  ariaLabel: string
  disabled?: boolean
  compact?: boolean
  tone?: 'neutral' | 'todo' | 'pending' | 'in-progress' | 'completed'
  className?: string
}

export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  compact = false,
  tone = 'neutral',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isOpen])

  function toggleOptions() {
    if (disabled) {
      return
    }

    setActiveIndex(selectedIndex)
    setIsOpen((current) => !current)
  }

  function selectOption(option: SelectOption) {
    onChange(option.value)
    setIsOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isOpen) {
        selectOption(options[activeIndex])
      } else {
        setActiveIndex(selectedIndex)
        setIsOpen(true)
      }
      return
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()
    setIsOpen(true)
    setActiveIndex((current) => {
      if (event.key === 'Home') return 0
      if (event.key === 'End') return options.length - 1
      if (event.key === 'ArrowDown') return Math.min(current + 1, options.length - 1)
      return Math.max(current - 1, 0)
    })
  }

  const classes = [
    'custom-select',
    compact ? 'custom-select--compact' : '',
    `custom-select--${tone}`,
    disabled ? 'custom-select--disabled' : '',
    isOpen ? 'custom-select--open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} ref={rootRef}>
      <button
        className="custom-select__trigger"
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-activedescendant={isOpen ? `${listboxId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={toggleOptions}
        onKeyDown={handleKeyDown}
      >
        <span>{selectedOption?.label ?? ''}</span>
        <ChevronDown size={compact ? 14 : 17} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="custom-select__options" id={listboxId} role="listbox">
          {options.map((option, index) => (
            <button
              className={
                index === activeIndex
                  ? 'custom-select__option custom-select__option--active'
                  : 'custom-select__option'
              }
              id={`${listboxId}-option-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
