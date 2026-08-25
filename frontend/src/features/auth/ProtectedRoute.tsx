import { Navigate, Outlet } from 'react-router'
import { useAuth } from './authContext'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
