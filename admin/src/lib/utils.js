import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export function formatDate(date, options = {}) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d)
}

export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num?.toString() ?? '0'
}

export function getStatusColor(status) {
  const map = {
    pending: 'warning',
    processing: 'info',
    'on-hold': 'warning',
    completed: 'success',
    cancelled: 'danger',
    refunded: 'danger',
    failed: 'danger',
    publish: 'success',
    draft: 'neutral',
    instock: 'success',
    outofstock: 'danger',
    onbackorder: 'warning',
    active: 'success',
    inactive: 'neutral',
  }
  return map[status?.toLowerCase()] ?? 'neutral'
}

export function timeAgo(date) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function truncate(str, length = 40) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
