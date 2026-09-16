import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag,
  Megaphone, Boxes, CreditCard, HelpCircle,
  ChevronDown, ChevronRight, Gift, X, Menu, ImageIcon, Layers, MessageSquare
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navigation = [
  {
    id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/',
  },
  {
    id: 'products', label: 'Products', icon: Package, path: '/products',
    submenu: [
      { label: 'All Products', path: '/products' },
      { label: 'Add New', path: '/products/new' },
      { label: 'Brands', path: '/products/brands' },
      { label: 'Categories', path: '/products/categories' },
      { label: 'Tags', path: '/products/tags' },
      { label: 'Attributes', path: '/products/attributes' },
      { label: 'Reviews', path: '/products/reviews' },
    ],
  },
  {
    id: 'ecommerce', label: 'Ecommerce', icon: ShoppingBag, path: '/orders',
    badge: 12,
    submenu: [
      { label: 'Home', path: '/' },
      { label: 'Orders', path: '/orders' },
      { label: 'Customers', path: '/customers' },
      { label: 'Coupons', path: '/coupons' },
      { label: 'Reports', path: '/reports' },
      { label: 'Settings', path: '/settings' },
      { label: 'Status', path: '/status' },
      { label: 'Extensions', path: '/extensions' },
    ],
  },
  {
    id: 'enquiries', label: 'Enquiries', icon: MessageSquare, path: '/enquiries',
  },
  {
    id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/marketing',
    submenu: [
      { label: 'Coupons', path: '/marketing/coupons' },
      { label: 'Campaigns', path: '/marketing/campaigns' },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', icon: Boxes, path: '/inventory',
    submenu: [
      { label: 'Stock Status', path: '/inventory' },
      { label: 'Low Stock', path: '/inventory/low-stock' },
    ],
  },
  {
    id: 'content', label: 'Content', icon: Layers, path: '/content',
    submenu: [
      { label: 'Home Banners', path: '/content/banners' },
      { label: 'Featured Category Slider', path: '/content/featured-categories' },
      { label: 'About Blog', path: '/content/about-blog' },
      { label: 'Product Section', path: '/content/product-section' },
      { label: 'Summer Sale', path: '/content/summer-sale' },
      { label: 'All Production', path: '/content/all-production' },
      { label: 'Great Saving', path: '/content/great-saving' },
      { label: 'Hottest Blog', path: '/content/hottest-blog' },
      { label: 'Blockbuster Deals', path: '/content/blockbuster' },
      { label: 'Featured Offer For You', path: '/content/offer-section' },
      { label: 'Featured Now', path: '/content/featured-now' },
      { label: 'Shortlist', path: '/content/shortlist' },
      { label: 'Brand Carousel', path: '/content/sponsored' },
      { label: 'Our Client', path: '/content/our-client' },
      { label: 'Collection (Top-Notch)', path: '/content/collection' },
    ],
  },
  {
    id: 'media', label: 'Media', icon: ImageIcon, path: '/media',
  },
  {
    id: 'payments', label: 'Payments & Shipping', icon: CreditCard, path: '/payments',
  },
  {
    id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help',
  },
]

function matchesPath(pathname, targetPath) {
  const target = targetPath.split('?')[0]
  return target === '/' ? pathname === '/' : pathname.startsWith(target)
}

function NavItem({ item, collapsed }) {
  const location = useLocation()
  const hasSubmenu = item.submenu?.length > 0
  const isActive = hasSubmenu
    ? item.submenu.some(sub => matchesPath(location.pathname, sub.path))
    : matchesPath(location.pathname, item.path)
  const [open, setOpen] = useState(() => hasSubmenu && isActive)

  if (hasSubmenu && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <item.icon size={18} className="shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {item.badge}
            </span>
          )}
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-0.5">
            {item.submenu.map(sub => (
              <NavLink
                key={sub.path}
                to={sub.path}
                end
                className={({ isActive }) => cn(
                  'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                  isActive ? 'text-blue-700 bg-blue-50 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                )}
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        collapsed && 'justify-center'
      )}
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Gift size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 whitespace-nowrap">CorporateGifts</p>
            <p className="text-xs text-gray-400 whitespace-nowrap">Dashboard</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-400 shrink-0"
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navigation.map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 shrink-0">
          v1.0 · Corporate Gifts
        </div>
      )}
    </aside>
  )
}
