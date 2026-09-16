import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  ShoppingCart, Users, IndianRupee, TrendingUp, AlertTriangle,
  Calendar, RefreshCw,
} from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Loading'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
]

function getRangeDates(key) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (key) {
    case 'today':
      return { dateFrom: today.toISOString(), dateTo: new Date(today.getTime() + 86400000 - 1).toISOString() }
    case '7d':
      return { dateFrom: new Date(today.getTime() - 6 * 86400000).toISOString(), dateTo: new Date(today.getTime() + 86400000 - 1).toISOString() }
    case '30d':
      return { dateFrom: new Date(today.getTime() - 29 * 86400000).toISOString(), dateTo: new Date(today.getTime() + 86400000 - 1).toISOString() }
    case 'month':
      return { dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), dateTo: new Date(today.getTime() + 86400000 - 1).toISOString() }
    case 'year':
      return { dateFrom: new Date(now.getFullYear(), 0, 1).toISOString(), dateTo: new Date(today.getTime() + 86400000 - 1).toISOString() }
    default:
      return {}
  }
}

function normalizeOrder(o) {
  const customer = o.customer && typeof o.customer === 'object'
    ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim()
    : o.billingAddress ? `${o.billingAddress.firstName || ''} ${o.billingAddress.lastName || ''}`.trim()
    : 'Guest'
  return { id: o.orderNumber || o._id, _id: o._id, customer: customer || 'Guest', date: o.createdAt, status: o.status, total: o.total }
}

export function DashboardPage() {
  const [range, setRange] = useState('30d')
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [stockAlerts, setStockAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true)
    try {
      const { dateFrom, dateTo } = getRangeDates(range)
      const params = new URLSearchParams()
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const [statsRes, revRes, ordersRes, lowStockRes, catRes] = await Promise.all([
        api.get(`/reports/dashboard/stats?${params}`),
        api.get(`/reports/revenue?${params}`),
        api.get('/orders?limit=6'),
        api.get('/products?stockStatus=outofstock&limit=5'),
        api.get('/reports/category-breakdown'),
      ])

      setStats(statsRes.data)

      if (revRes.data?.length > 0) {
        setRevenue(revRes.data.map(d => ({
          date: d._id?.slice(5) || d._id,
          revenue: d.revenue,
          orders: d.orders,
        })))
      } else {
        setRevenue([])
      }

      setRecentOrders((ordersRes.data.orders || []).map(normalizeOrder))
      setStockAlerts(lowStockRes.data.products || [])
      if (catRes.data?.length > 0) setCategoryData(catRes.data)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [range])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const s = stats || {}
  const avgOrder = s.avgOrderValue ?? (s.totalOrders > 0 ? s.totalRevenue / s.totalOrders : 0)

  return (
    <div className="space-y-6">
      {/* Header with date range */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Store performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-0.5">
            <Calendar size={13} className="text-gray-400 mx-2 shrink-0" />
            {RANGES.map(r => (
              <button key={r.key} onClick={() => setRange(r.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  range === r.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(s.totalRevenue || 0)}
          change={s.changes?.revenue ?? undefined}
          icon={IndianRupee}
          iconBg="bg-blue-50" iconColor="text-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={(s.totalOrders || 0).toLocaleString()}
          change={s.changes?.orders ?? undefined}
          icon={ShoppingCart}
          iconBg="bg-orange-50" iconColor="text-orange-600"
        />
        <StatCard
          title="Total Customers"
          value={(s.totalCustomers || 0).toLocaleString()}
          icon={Users}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(avgOrder)}
          icon={TrendingUp}
          iconBg="bg-purple-50" iconColor="text-purple-600"
        />
      </div>

      {/* Revenue chart + Category pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <span className="text-xs text-gray-400">
              {RANGES.find(r => r.key === range)?.label}
            </span>
          </CardHeader>
          <CardBody>
            {revenue.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                No revenue data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
          <CardBody>
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-400">No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [`${v}%`, 'Share']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {categoryData.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.fill || COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 truncate">{c.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800 ml-2">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Orders + Orders bar chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/orders" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </CardHeader>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-sm text-center text-gray-400">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <Link key={order._id} to={`/orders/${order._id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">#{String(order.id).slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{order.customer} · {formatDate(order.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" /> Stock Alerts
            </CardTitle>
            <Link to="/inventory" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </CardHeader>
          {stockAlerts.length === 0 ? (
            <div className="px-5 py-8 text-sm text-center text-gray-400">
              <p className="font-medium text-emerald-600">All products in stock!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stockAlerts.map(item => (
                <div key={item._id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 truncate flex-1 pr-2">{item.name}</p>
                    <StatusBadge status={item.stockStatus} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    SKU: {item.sku} ·{' '}
                    <span className={item.stockQuantity === 0 ? 'text-red-600 font-medium' : 'text-amber-600 font-medium'}>
                      {item.stockQuantity === 0 ? 'Out of stock' : `${item.stockQuantity} left`}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Orders bar chart */}
      {revenue.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Order Volume</CardTitle></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" name="Orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
