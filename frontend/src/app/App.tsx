import { Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import { useAuth } from '../features/auth/authContext'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { TasksPage } from '../pages/TasksPage'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/tasks" replace /> : <LoginPage />}
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/tasks' : '/login'} replace />}
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
