import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, Eye, Printer, ShoppingCart, Calendar, Check, X, ChevronDown } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { NoData, Spinner } from '../../components/ui/Loading'
import api from '../../lib/api'

const STATUS_TABS = ['all', 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded']

const BULK_STATUSES = ['processing', 'on-hold', 'completed', 'cancelled', 'refunded']

const DATE_RANGES = [
  { key: '', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
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
  const customerName = o.customer
    ? (typeof o.customer === 'object' ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : o.customer)
    : o.billingAddress?.firstName ? `${o.billingAddress.firstName} ${o.billingAddress.lastName || ''}`.trim() : 'Guest'
  return {
    id: o.orderNumber || o._id,
    _id: o._id,
    customer: customerName || 'Guest',
    email: (typeof o.customer === 'object' ? o.customer?.email : '') || o.billingAddress?.email || '',
    date: o.createdAt,
    status: o.status,
    paymentMethod: o.paymentMethodTitle || o.paymentMethod || '',
    total: o.total || 0,
  }
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [dateRange, setDateRange] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [selected, setSelected] = useState([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (activeTab !== 'all') params.set('status', activeTab)
      if (search) params.set('search', search)
      const { dateFrom, dateTo } = getRangeDates(dateRange)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const { data } = await api.get(`/orders?${params}`)
      setOrders((data.orders || []).map(normalizeOrder))
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }, [page, activeTab, search, dateRange])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); setSelected([]) }
  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(selected.length === orders.length ? [] : orders.map(o => o._id))

  const handleBulkStatus = async () => {
    if (!bulkStatus || !selected.length) return
    setBulkLoading(true)
    try {
      await api.post('/orders/bulk/status', { ids: selected, status: bulkStatus })
      setSelected([]); setBulkStatus(''); fetchOrders()
    } catch {}
    setBulkLoading(false)
  }

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Status', 'Payment', 'Total']
    const rows = orders.map(o => [
      String(o.id).slice(-8).toUpperCase(),
      `"${o.customer}"`,
      o.email,
      formatDate(o.date),
      o.status,
      o.paymentMethod,
      o.total.toFixed(2),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `orders-${dateRange || 'all'}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">{total} total orders</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <Card>
        {/* Status tabs */}
        <div className="flex gap-0 overflow-x-auto border-b border-gray-100">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'all' ? 'All' : tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search order, customer…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            <select value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1) }}
              className="text-sm bg-transparent focus:outline-none text-gray-700">
              {DATE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
            <span className="text-sm font-medium text-blue-700">{selected.length} selected</span>
            <div className="flex items-center gap-2">
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
                className="text-sm border border-blue-200 rounded-lg px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Change status to…</option>
                {BULK_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <Button size="sm" onClick={handleBulkStatus} disabled={!bulkStatus || bulkLoading}>
                <Check size={13} /> {bulkLoading ? 'Updating…' : 'Apply'}
              </Button>
            </div>
            <button onClick={() => setSelected([])} className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <X size={13} /> Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : orders.length === 0 ? (
          <NoData title="No orders found" icon={<ShoppingCart size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="pl-4 pr-2 py-3 w-10">
                    <input type="checkbox" checked={selected.length === orders.length && orders.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 text-blue-600" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order._id} className={`transition-colors hover:bg-gray-50/50 ${selected.includes(order._id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="pl-4 pr-2 py-3">
                      <input type="checkbox" checked={selected.includes(order._id)}
                        onChange={() => toggleSelect(order._id)} className="rounded border-gray-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                        #{String(order.id).slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell capitalize">{order.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/orders/${order._id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="View">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Print">
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {orders.length} of {total} orders</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Prev</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1 text-sm rounded-lg ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
