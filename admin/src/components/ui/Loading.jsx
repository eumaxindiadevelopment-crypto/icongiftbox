import { cn } from '../../lib/utils'

export function Spinner({ size = 'md', className }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' }
  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-blue-600', s[size], className)} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner size="lg" />
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function NoData({ title = 'No data found', message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 mb-4">{icon || <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" /></svg>}</div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {message && <p className="text-xs text-gray-400 mt-1">{message}</p>}
    </div>
  )
}
