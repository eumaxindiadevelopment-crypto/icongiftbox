import { cn } from '../../lib/utils'

const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger:  'bg-red-50 text-red-700 ring-red-600/20',
  info:    'bg-blue-50 text-blue-700 ring-blue-600/20',
  neutral: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  primary: 'bg-blue-50 text-blue-700 ring-blue-700/20',
}

export function Badge({ variant = 'neutral', children, className }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

const statusLabels = {
  pending: { label: 'Pending', variant: 'warning' },
  processing: { label: 'Processing', variant: 'info' },
  'on-hold': { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'danger' },
  failed: { label: 'Failed', variant: 'danger' },
  publish: { label: 'Published', variant: 'success' },
  draft: { label: 'Draft', variant: 'neutral' },
  pending_review: { label: 'Pending Review', variant: 'warning' },
  instock: { label: 'In Stock', variant: 'success' },
  outofstock: { label: 'Out of Stock', variant: 'danger' },
  lowstock: { label: 'Low Stock', variant: 'warning' },
  onbackorder: { label: 'On Backorder', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'neutral' },
  expired: { label: 'Expired', variant: 'danger' },
}

export function StatusBadge({ status }) {
  const config = statusLabels[status?.toLowerCase()] ?? { label: status, variant: 'neutral' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
