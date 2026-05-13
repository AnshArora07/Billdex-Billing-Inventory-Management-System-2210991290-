import Sidebar from './Sidebar'
import Topbar from './Topbar'

// Wraps all protected pages with the fixed sidebar and topbar
export default function DashboardLayout({ children }) {
  return (
    <div className="app-shell-bg">
      <Sidebar />
      <Topbar />
      {/* Main content — offset for sidebar (w-56) and topbar (h-14) */}
      <main className="ml-56 pt-14 p-6 min-h-screen relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-5 right-8 h-44 w-44 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute bottom-6 left-8 h-40 w-40 rounded-full bg-sky-100/40 blur-3xl" />
        </div>
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  )
}
