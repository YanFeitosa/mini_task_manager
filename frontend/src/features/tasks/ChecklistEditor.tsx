import { Plus, Square, SquareCheckBig, Trash2 } from 'lucide-react'
import './ChecklistEditor.css'

export type ChecklistFormItem = {
  key: string
  description: string
  completed: boolean
}

type ChecklistEditorProps = {
  items: ChecklistFormItem[]
  error?: string
  onChange: (items: ChecklistFormItem[]) => void
}

const MAX_ITEMS = 20

export function ChecklistEditor({ items, error, onChange }: ChecklistEditorProps) {
  function addItem() {
    if (items.length >= MAX_ITEMS) {
      return
    }

    onChange([
      ...items,
      {
        key: crypto.randomUUID(),
        description: '',
        completed: false,
      },
    ])
  }

  function updateItem(key: string, changes: Partial<Omit<ChecklistFormItem, 'key'>>) {
    onChange(items.map((item) => (item.key === key ? { ...item, ...changes } : item)))
  }

  function removeItem(key: string) {
    onChange(items.filter((item) => item.key !== key))
  }

  return (
    <section className="checklist-editor" aria-labelledby="checklist-editor-title">
      <div className="checklist-editor__heading">
        <div>
          <h2 id="checklist-editor-title">Checklist</h2>
          <p>Adicione etapas opcionais para acompanhar o progresso.</p>
        </div>
        <button type="button" disabled={items.length >= MAX_ITEMS} onClick={addItem}>
          <Plus size={16} aria-hidden="true" />
          Adicionar item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="checklist-editor__empty">Nenhum item adicionado.</p>
      ) : (
        <div className="checklist-editor__items">
          {items.map((item, index) => (
            <div className="checklist-editor__item" key={item.key}>
              <button
                className="checklist-editor__toggle"
                type="button"
                aria-label={item.completed ? `Desmarcar item ${index + 1}` : `Marcar item ${index + 1}`}
                aria-pressed={item.completed}
                onClick={() => updateItem(item.key, { completed: !item.completed })}
              >
                {item.completed ? (
                  <SquareCheckBig size={19} aria-hidden="true" />
                ) : (
                  <Square size={19} aria-hidden="true" />
                )}
              </button>
              <input
                type="text"
                maxLength={255}
                value={item.description}
                aria-label={`Descrição do item ${index + 1}`}
                placeholder={`Item ${index + 1}`}
                onChange={(event) => updateItem(item.key, { description: event.target.value })}
              />
              <button
                className="checklist-editor__remove"
                type="button"
                aria-label={`Remover item ${index + 1}`}
                onClick={() => removeItem(item.key)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="checklist-editor__error">{error}</span>}
    </section>
  )
}
