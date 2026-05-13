import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, clearAuth } from '../utils/auth'

export default function Topbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser()
      setUser(userData)
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-white/90 backdrop-blur border-b border-blue-100 flex items-center justify-between px-6 z-10 shadow-sm shadow-blue-100/40">

      {/* Left — page context (org name) */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Organisation:</span>
        <span className="text-sm font-medium text-gray-700">
          {user?.organisationName || '—'}
        </span>
      </div>

      {/* Right — user info + logout */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-gray-700 leading-tight">{user?.name || 'User'}</p>
        </div>

        {/* Avatar circle */}
        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold uppercase select-none">
          {user?.name?.[0] || 'U'}
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-500 transition font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
