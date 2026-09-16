import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, Calendar, DollarSign, ShoppingCart, Users, TrendingUp, Package } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatCard } from '../../components/ui/StatCard'
import { Spinner } from '../../components/ui/Loading'
import { formatCurrency } from '../../lib/utils'
import api from '../../lib/api'

const TABS = [
  { key: 'sales', label: 'Sales' },
  { key: 'products', label: 'Products' },
  { key: 'customers', label: 'Customers' },
]

const DATE_RANGES = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: '3m', label: '3 Months' },
  { key: 'year', label: 'This Year' },
]

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

function getRangeDates(key) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(today.getTime() + 86400000 - 1).toISOString()
  switch (key) {
    case '7d':   return { dateFrom: new Date(today.getTime() - 6 * 86400000).toISOString(), dateTo: end }
    case '30d':  return { dateFrom: new Date(today.getTime() - 29 * 86400000).toISOString(), dateTo: end }
    case 'month': return { dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), dateTo: end }
    case '3m':   return { dateFrom: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(), dateTo: end }
    case 'year': return { dateFrom: new Date(now.getFullYear(), 0, 1).toISOString(), dateTo: end }
    default:     return {}
  }
}

export function ReportsPage() {
  const [tab, setTab] = useState('sales')
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  // Sales
  const [salesSummary, setSalesSummary] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  // Products
  const [topProducts, setTopProducts] = useState([])
  const [stockStats, setStockStats] = useState([])

  // Customers
  const [customerStats, setCustomerStats] = useState(null)
  const [topCustomers, setTopCustomers] = useState([])
  const [customerGrowth, setCustomerGrowth] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    const { dateFrom, dateTo } = getRangeDates(dateRange)
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)

    try {
      if (tab === 'sales') {
        const [salesRes, revRes, catRes] = await Promise.all([
          api.get(`/reports/sales?${params}`),
          api.get(`/reports/revenue?${params}`),
          api.get('/reports/category-breakdown'),
        ])
        setSalesSummary(salesRes.data.summary)
        setRevenueData((revRes.data || []).map(d => ({
          date: d._id?.slice(5) || d._id,
          revenue: d.revenue,
          orders: d.orders,
        })))
        setCategoryData(catRes.data || [])
      } else if (tab === 'products') {
        const [prodRes, stockRes] = await Promise.all([
          api.get('/products?limit=10'),
          api.get('/reports/products'),
        ])
        setTopProducts((prodRes.data.products || []).map(p => ({
          id: p._id,
          name: p.name?.length > 30 ? p.name.slice(0, 30) + '…' : p.name,
          fullName: p.name,
          sku: p.sku,
          sales: p.totalSales || 0,
          revenue: (p.totalSales || 0) * (p.price || 0),
          stock: p.stockQuantity || 0,
          status: p.stockStatus,
          price: p.price || 0,
        })))
        setStockStats(stockRes.data.stockStats || [])
      } else if (tab === 'customers') {
        const [custRes, growthRes] = await Promise.all([
          api.get('/reports/customers'),
          api.get('/reports/customer-growth'),
        ])
        setCustomerStats(custRes.data)
        setTopCustomers(custRes.data.topCustomers || [])
        setCustomerGrowth(growthRes.data || [])
      }
    } catch {}
    setLoading(false)
  }, [tab, dateRange])

  useEffect(() => { load() }, [load])

  const exportCSV = () => {
    let csv = ''
    if (tab === 'sales') {
      csv = 'Date,Revenue,Orders\n' + revenueData.map(d => `${d.date},${d.revenue},${d.orders}`).join('\n')
    } else if (tab === 'products') {
      csv = 'Name,SKU,Units Sold,Revenue,Stock\n' + topProducts.map(p => `"${p.fullName}",${p.sku},${p.sales},${p.revenue},${p.stock}`).join('\n')
    } else if (tab === 'customers') {
      csv = 'Name,Email,Orders,Total Spent\n' + topCustomers.map(c => `"${c.firstName} ${c.lastName}",${c.email},${c.totalOrders},${c.totalSpent}`).join('\n')
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `report-${tab}-${dateRange}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const stockStatusMap = {}
  stockStats.forEach(s => { stockStatusMap[s._id] = s.count })

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-500 mt-0.5">Analyse your store performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab switcher */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-0.5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          {/* Date range */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Calendar size={13} className="text-gray-400" />
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="text-sm bg-transparent focus:outline-none text-gray-700">
              {DATE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={14} /> Export</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* ── SALES TAB ── */}
          {tab === 'sales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Gross Revenue" value={formatCurrency(salesSummary?.total || 0)} icon={DollarSign} iconBg="bg-blue-50" iconColor="text-blue-600" />
                <StatCard title="Net Revenue" value={formatCurrency((salesSummary?.total || 0) * 0.9)} icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                <StatCard title="Total Orders" value={(salesSummary?.count || 0).toLocaleString()} icon={ShoppingCart} iconBg="bg-orange-50" iconColor="text-orange-600" />
                <StatCard title="Avg Order Value" value={formatCurrency(salesSummary?.avgOrder || 0)} icon={DollarSign} iconBg="bg-purple-50" iconColor="text-purple-600" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                  <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
                  <CardBody>
                    {revenueData.length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-sm text-gray-400">No data for this period</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                          <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" dot={false} />
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
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                              {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={v => [`${v}%`, 'Share']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                          {categoryData.map((c, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.fill || COLORS[i % COLORS.length] }} />
                                <span className="text-gray-600 truncate">{c.name}</span>
                              </div>
                              <span className="font-semibold text-gray-800">{c.value}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              </div>

              {revenueData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Order Volume</CardTitle></CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={revenueData}>
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
          )}

          {/* ── PRODUCTS TAB ── */}
          {tab === 'products' && (
            <div className="space-y-6">
              {/* Stock summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="In Stock" value={(stockStatusMap['instock'] || 0).toString()} icon={Package} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                <StatCard title="Out of Stock" value={(stockStatusMap['outofstock'] || 0).toString()} icon={Package} iconBg="bg-red-50" iconColor="text-red-600" />
                <StatCard title="On Backorder" value={(stockStatusMap['onbackorder'] || 0).toString()} icon={Package} iconBg="bg-amber-50" iconColor="text-amber-600" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Products by Stock Status</CardTitle></CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={stockStats.map((s, i) => ({ name: s._id, value: s.count, fill: ['#10b981', '#ef4444', '#f59e0b'][i] || COLORS[i] }))}
                          cx="50%" cy="50%" outerRadius={80} dataKey="value">
                          {stockStats.map((_, i) => <Cell key={i} fill={['#10b981', '#ef4444', '#f59e0b'][i] || COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Top Products by Price</CardTitle></CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => [formatCurrency(v), 'Price']} />
                        <Bar dataKey="price" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Product Inventory</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">SKU</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3 text-right">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topProducts.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-300">{i + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-xs truncate">{p.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono">{p.sku}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(p.price)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{p.stock} units</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              p.status === 'instock' ? 'bg-emerald-50 text-emerald-700' :
                              p.status === 'outofstock' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ── CUSTOMERS TAB ── */}
          {tab === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Customers" value={(customerStats?.total || 0).toLocaleString()} icon={Users} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                <StatCard title="Top Spenders Listed" value={(topCustomers.length).toString()} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
              </div>

              {customerGrowth.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Customer Acquisition</CardTitle></CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={customerGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="new" name="New Customers" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="returning" name="Returning" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Top Customers by Spend</CardTitle></CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-right">Orders</th>
                        <th className="px-4 py-3 text-right">Total Spent</th>
                        <th className="px-4 py-3 text-right">Avg Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topCustomers.map((c, i) => (
                        <tr key={c._id || i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-300">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                                {c.firstName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{c.firstName} {c.lastName}</p>
                                <p className="text-xs text-gray-400">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{c.totalOrders || 0}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{formatCurrency(c.totalSpent || 0)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {c.totalOrders > 0 ? formatCurrency((c.totalSpent || 0) / c.totalOrders) : '—'}
                          </td>
                        </tr>
                      ))}
                      {topCustomers.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-sm text-center text-gray-400">No customer data yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
