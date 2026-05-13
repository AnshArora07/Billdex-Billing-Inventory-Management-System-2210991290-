import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../utils/auth'

// Redirects unauthenticated users to /login
export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return children
}
