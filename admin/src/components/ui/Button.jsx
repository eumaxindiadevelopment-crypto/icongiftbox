import { cn } from '../../lib/utils'

const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

const variants = {
  primary:  'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary:'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300',
  danger:   'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:    'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  link:     'text-blue-600 hover:underline focus:ring-blue-300 p-0',
}

const sizes = {
  xs: 'text-xs px-2.5 py-1.5',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function IconButton({ className, children, size = 'md', ...props }) {
  const s = { xs: 'p-1', sm: 'p-1.5', md: 'p-2', lg: 'p-2.5' }
  return (
    <button
      className={cn('inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none', s[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
