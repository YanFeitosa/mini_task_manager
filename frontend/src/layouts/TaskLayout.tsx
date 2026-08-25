import { CircleUserRound, LogOut } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router'
import { AppBrand } from '../components/AppBrand'
import { useAuth } from '../features/auth/authContext'
import './TaskLayout.css'

export function TaskLayout() {
  const navigate = useNavigate()
  const { userName, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="task-layout">
      <header className="app-header">
        <div className="app-header__content">
          <AppBrand />

          <div className="app-header__actions">
            <div className="app-user">
              <CircleUserRound size={20} aria-hidden="true" />
              <span>
                <small>Conectado como</small>
                <strong>{userName ?? 'Usuário'}</strong>
              </span>
            </div>
            <button className="app-logout" type="button" onClick={handleLogout}>
              <LogOut size={18} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
