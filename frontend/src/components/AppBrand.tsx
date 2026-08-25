import { ListTodo } from 'lucide-react'
import './AppBrand.css'

export function AppBrand() {
  return (
    <div className="app-brand" aria-label="Mini Task Manager">
      <span className="app-brand__icon" aria-hidden="true">
        <ListTodo size={23} strokeWidth={2} />
      </span>
      <span className="app-brand__copy">
        <strong>Mini Task Manager</strong>
        <small>Organização em equipe</small>
      </span>
    </div>
  )
}
