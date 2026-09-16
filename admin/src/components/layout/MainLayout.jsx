import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '../../lib/utils'

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-300', collapsed ? 'ml-16' : 'ml-64')}>
        <Header />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 max-w-[1400px] mx-auto w-full flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
