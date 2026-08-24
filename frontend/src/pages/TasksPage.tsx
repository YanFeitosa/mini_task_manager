import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AppBrand } from '../components/AppBrand'
import { useAuth } from '../features/auth/authContext'

export function TasksPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header>
      <AppBrand />
      <button type="button" onClick={handleLogout}>
        <LogOut size={18} aria-hidden="true" />
        Sair
      </button>
    </header>
  )
}
