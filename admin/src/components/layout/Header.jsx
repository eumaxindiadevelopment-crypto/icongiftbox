import { useEffect, useRef, useState } from 'react'
import { Bell, Search, User, ChevronDown, LogOut, Settings, ExternalLink, PackageX, PackageMinus, ShoppingCart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { timeAgo } from '../../lib/utils'
import api from '../../lib/api'

const breadcrumbMap = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/products/new': 'Add New Product',
  '/products/categories': 'Categories',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/customers/new': 'Add Customer',
  '/reports': 'Reports',
  '/reports/sales': 'Sales Report',
  '/reports/products': 'Product Performance',
  '/reports/customers': 'Customer Reports',
  '/marketing': 'Marketing',
  '/marketing/coupons': 'Coupons',
  '/inventory': 'Inventory',
  '/inventory/low-stock': 'Low Stock',
  '/payments': 'Payments & Shipping',
  '/settings': 'Settings',
  '/settings/general': 'General Settings',
  '/settings/tax': 'Tax Settings',
  '/settings/shipping': 'Shipping Settings',
  '/settings/payment': 'Payment Settings',
  '/settings/email': 'Email Settings',
  '/settings/api': 'API Settings',
  '/help': 'Help & Support',
}

// Fallback patterns for dynamic routes (edit/detail pages) not in breadcrumbMap
const dynamicBreadcrumbs = [
  { test: /^\/products\/[^/]+\/edit$/, label: 'Edit Product' },
  { test: /^\/products\/[^/]+$/, label: 'Product Details' },
  { test: /^\/orders\/[^/]+$/, label: 'Order Details' },
  { test: /^\/customers\/[^/]+$/, label: 'Customer Details' },
  { test: /^\/settings\/[^/]+$/, label: 'Settings' },
]

function getPageTitle(pathname) {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname]
  const match = dynamicBreadcrumbs.find(r => r.test.test(pathname))
  return match ? match.label : 'Dashboard'
}

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || 'A'

const notifIcon = {
  order: ShoppingCart,
  'low-stock': PackageMinus,
  'out-of-stock': PackageX,
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const notifRef = useRef(null)
  const userRef = useRef(null)

  const pageTitle = getPageTitle(location.pathname)

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const [notifications, setNotifications] = useState([])

  const fetchNotifications = () => {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, unread: false })))

  const handleNotificationClick = (n) => {
    setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, unread: false } : x))
    setNotifOpen(false)
    if (n.link) navigate(n.link)
  }

  const handleSearch = (e) => {
    if (e.key !== 'Enter' || !searchTerm.trim()) return
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 gap-4 shrink-0">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, SKU…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-52"
          />
        </div>

        {/* View Website */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
        >
          <ExternalLink size={14} />
          View Website
        </a>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false) }}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-[3px] bg-red-500 rounded-full text-[9px] leading-[14px] text-white text-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-400 text-center">You're all caught up</p>
                ) : (
                  notifications.map(n => {
                    const Icon = notifIcon[n.type] || Bell
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-2.5 ${n.unread ? 'bg-blue-50/50' : ''}`}
                      >
                        <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <span>
                          <p className="text-sm text-gray-700">{n.text}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.date)}</p>
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              {user?.name ? (
                <span className="text-white text-[11px] font-semibold">{initials(user.name)}</span>
              ) : (
                <User size={14} className="text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name || 'Admin'}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@corporategifts.in'}</p>
                {user?.role && (
                  <p className="text-[10px] text-blue-600 mt-0.5 capitalize">{user.role.replace('_', ' ')}</p>
                )}
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
