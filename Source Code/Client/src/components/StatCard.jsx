// A simple summary card used on the Dashboard page
export default function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-brand-50  text-brand-600',
    green:  'bg-green-50  text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50  text-amber-600',
  }

  return (
    <div className="card p-5 flex items-center gap-4">
      {/* Icon badge */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
        {icon}
      </div>

      {/* Stats */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
