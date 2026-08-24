import { Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import { useAuth } from '../features/auth/authContext'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { TaskLayout } from '../layouts/TaskLayout'
import { TaskDetailsPage } from '../pages/TaskDetailsPage'
import { TaskFormPage } from '../pages/TaskFormPage'
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
        <Route element={<TaskLayout />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage mode="edit" />} />
        </Route>
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
