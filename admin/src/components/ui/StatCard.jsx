import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function StatCard({ title, value, change, icon: Icon, iconBg = 'bg-blue-50', iconColor = 'text-blue-600', prefix = '', suffix = '' }) {
  const isPositive = change >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-500')}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{prefix}{value}{suffix}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
    </div>
  )
}
