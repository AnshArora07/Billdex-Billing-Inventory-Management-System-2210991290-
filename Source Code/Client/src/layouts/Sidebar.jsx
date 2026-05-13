import { NavLink } from 'react-router-dom'
import BrandWord from '../components/BrandWord'

// Icons as simple inline SVG components — no icon library needed
const Icon = ({ path }) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
)

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    label: 'Products',
    to: '/products',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Billing',
    to: '/billing',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    label: 'Sales',
    to: '/sales',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: 'M5.121 17.804A9.97 9.97 0 0112 15c2.298 0 4.415.774 6.121 2.074M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white/95 backdrop-blur border-r border-blue-100 flex flex-col z-20 shadow-sm shadow-blue-100/40">

      {/* Logo / Brand */}
      <div className="h-14 flex items-center px-5 border-b border-blue-100">
        <BrandWord className="font-semibold tracking-tight text-lg" dexClassName="text-gray-800" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                  : 'text-gray-500 hover:bg-blue-50/70 hover:text-gray-800'
              }`
            }
          >
            <Icon path={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer hint */}
      <div className="px-5 py-4 border-t border-blue-100">
        <p className="text-[11px] text-gray-400">
          <BrandWord className="font-semibold" dexClassName="text-gray-500" /> v1.0
        </p>
      </div>
    </aside>
  )
}
