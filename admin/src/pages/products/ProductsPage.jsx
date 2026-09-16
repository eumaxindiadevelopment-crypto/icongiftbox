import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Download, Package,
  Star, Check, X,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/Modal'
import { NoData, Spinner } from '../../components/ui/Loading'
import api, { SERVER_URL, FRONTEND_URL } from '../../lib/api'
import { buildProductUrl } from '../../lib/seoUrl'

const toAbsUrl = (src) =>
  !src ? '' : src.startsWith('http') ? src : `${SERVER_URL}${src}`

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'publish', label: 'Published' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending', label: 'Pending' },
  { key: 'trash', label: 'Trash' },
]

const BULK_ACTIONS = [
  { key: 'publish', label: 'Set Published' },
  { key: 'draft', label: 'Set Draft' },
  { key: 'featured', label: 'Mark Featured' },
  { key: 'unfeatured', label: 'Remove Featured' },
  { key: 'trash', label: 'Move to Trash' },
]

const TRASH_BULK_ACTIONS = [
  { key: 'restore', label: 'Restore' },
  { key: 'delete', label: 'Delete Permanently' },
]

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [statusTab, setStatusTab] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [quickEdit, setQuickEdit] = useState(null) // product _id being quick-edited
  const [qeForm, setQeForm] = useState({})
  const [qeSaving, setQeSaving] = useState(false)

  useEffect(() => {
    api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : r.data.categories || [])).catch(() => {})
  }, [])

  // Keep in sync with ?search= navigated to from the header search box
  
  useEffect(() => {
    const q = searchParams.get('search') || ''
    setSearch(q)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (statusTab !== 'all') params.set('status', statusTab)
      if (stockFilter !== 'all') params.set('stockStatus', stockFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (search) params.set('search', search)
      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [page, statusTab, stockFilter, typeFilter, categoryFilter, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const bulkActionsList = statusTab === 'trash' ? TRASH_BULK_ACTIONS : BULK_ACTIONS

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(selected.length === products.length ? [] : products.map(p => p._id))

  const handleDelete = async (id) => {
    try { await api.delete(`/products/${id}`); fetchProducts() } catch {}
    setDeleteId(null)
  }

  const handleTrash = async (id) => {
    try { await api.put(`/products/${id}`, { status: 'trash' }); fetchProducts() } catch {}
  }

  const handleRestore = async (id) => {
    try { await api.put(`/products/${id}`, { status: 'draft' }); fetchProducts() } catch {}
  }

  const handleDuplicate = async (product) => {
    try {
      const payload = {
        ...product,
        _id: undefined, __v: undefined, createdAt: undefined, updatedAt: undefined,
        name: `${product.name} (Copy)`,
        slug: `${product.slug || ''}-copy`,
        sku: `${product.sku || ''}-copy`,
        status: 'draft',
      }
      await api.post('/products', payload)
      fetchProducts()
    } catch {}
  }

  const toggleFeatured = async (product) => {
    try {
      await api.post('/products/bulk/update', { ids: [product._id], update: { featured: !product.featured } })
      fetchProducts()
    } catch {}
  }

  const handleBulkApply = async () => {
    if (!bulkAction || !selected.length) return
    if (bulkAction === 'delete') { setConfirmBulkDelete(true); return }
    try {
      if (bulkAction === 'publish' || bulkAction === 'draft' || bulkAction === 'trash') {
        await api.post('/products/bulk/update', { ids: selected, update: { status: bulkAction } })
      } else if (bulkAction === 'restore') {
        await api.post('/products/bulk/update', { ids: selected, update: { status: 'draft' } })
      } else if (bulkAction === 'featured') {
        await api.post('/products/bulk/update', { ids: selected, update: { featured: true } })
      } else if (bulkAction === 'unfeatured') {
        await api.post('/products/bulk/update', { ids: selected, update: { featured: false } })
      }
      setSelected([]); setBulkAction(''); fetchProducts()
    } catch {}
  }

  const handleBulkDelete = async () => {
    try {
      await api.post('/products/bulk/delete', { ids: selected })
      setSelected([]); setBulkAction(''); fetchProducts()
    } catch {}
    setConfirmBulkDelete(false)
  }

  const openQuickEdit = (product) => {
    setQuickEdit(product._id)
    setQeForm({
      name: product.name || '',
      sku: product.sku || '',
      price: product.regularPrice ?? product.price ?? '',
      salePrice: product.salePrice ?? '',
      stockQuantity: product.stockQuantity ?? '',
      status: product.status || 'draft',
      featured: product.featured || false,
    })
  }

  const saveQuickEdit = async (id) => {
    setQeSaving(true)
    try {
      await api.put(`/products/${id}`, {
        name: qeForm.name,
        sku: qeForm.sku,
        price: Number(qeForm.salePrice) || Number(qeForm.price) || 0,
        regularPrice: Number(qeForm.price) || 0,
        salePrice: qeForm.salePrice ? Number(qeForm.salePrice) : undefined,
        stockQuantity: Number(qeForm.stockQuantity) || 0,
        status: qeForm.status,
        featured: qeForm.featured,
      })
      setQuickEdit(null)
      fetchProducts()
    } catch {}
    setQeSaving(false)
  }

  const exportCSV = () => {
    const headers = ['Name', 'SKU', 'Price', 'Sale Price', 'Stock', 'Status', 'Categories']
    const rows = products.map(p => [
      `"${p.name?.replace(/"/g, '""') || ''}"`,
      p.sku || '',
      p.regularPrice ?? p.price ?? '',
      p.salePrice || '',
      p.stockQuantity ?? '',
      p.status || '',
      `"${p.categories?.map(c => c.name || c).join(', ') || ''}"`,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Products</h1>
          <p className="text-xs text-gray-500 mt-0.5">{total} total products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={14} /> Export</Button>
          <Button size="sm" onClick={() => navigate('/products/new')}><Plus size={14} /> Add Product</Button>
        </div>
      </div>

      <Card>
        {/* Status tabs */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-gray-100">
          {STATUS_TABS.map(tab => (
            <button key={tab.key} onClick={() => { setStatusTab(tab.key); setPage(1); setSelected([]) }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                statusTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
          <span className="ml-auto pr-4 text-xs text-gray-400 whitespace-nowrap">{total} item{total === 1 ? '' : 's'}</span>
        </div>

        {/* Bulk actions + filters row */}
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-100">
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Bulk actions</option>
            {bulkActionsList.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
          <Button variant="secondary" size="sm" onClick={handleBulkApply} disabled={!bulkAction || !selected.length}>
            <Check size={13} /> Apply
          </Button>
          {selected.length > 0 && (
            <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
              {selected.length} selected
              <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
            </span>
          )}
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Filter by product type</option>
            <option value="simple">Simple product</option>
            <option value="variable">Variable product</option>
          </select>
          <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1) }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Filter by stock status</option>
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
          </select>
          <div className="relative ml-auto min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products, SKU…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : products.length === 0 ? (
          <NoData title="No products found" message="Add your first product to get started" icon={<Package size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="pl-4 pr-2 py-3 w-10">
                    <input type="checkbox" checked={selected.length === products.length && products.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 text-blue-600" />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-14" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categories</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <Star size={13} className="inline text-gray-400" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <>
                    <tr key={product._id}
                      className={`group transition-colors ${quickEdit === product._id ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="pl-4 pr-2 py-3">
                        <input type="checkbox" checked={selected.includes(product._id)}
                          onChange={() => toggleSelect(product._id)} className="rounded border-gray-300 text-blue-600" />
                      </td>
                      {/* Thumbnail */}
                      <td className="px-3 py-3">
                        {product.images?.[0]?.src ? (
                          <img src={toAbsUrl(product.images[0].src)} alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={14} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/products/${product._id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 leading-tight">
                          {product.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>ID: {product.wcProductId ?? product._id.slice(-6)}</span>
                          {statusTab === 'trash' ? (
                            <>
                              <span>|</span>
                              <button onClick={() => handleRestore(product._id)} className="text-blue-600 hover:text-blue-700 hover:underline">Restore</button>
                              <span>|</span>
                              <button onClick={() => setDeleteId(product._id)} className="text-red-600 hover:text-red-700 hover:underline">Delete Permanently</button>
                            </>
                          ) : (
                            <>
                              <span>|</span>
                              <Link to={`/products/${product._id}/edit`} className="text-blue-600 hover:text-blue-700 hover:underline">Edit</Link>
                              <span>|</span>
                              <button onClick={() => openQuickEdit(product)} className="text-blue-600 hover:text-blue-700 hover:underline">Quick Edit</button>
                              <span>|</span>
                              <button onClick={() => handleTrash(product._id)} className="text-red-600 hover:text-red-700 hover:underline">Trash</button>
                              <span>|</span>
                              <a href={`${FRONTEND_URL}${buildProductUrl(product)}`} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline">View</a>
                              <span>|</span>
                              <button onClick={() => handleDuplicate(product)} className="text-blue-600 hover:text-blue-700 hover:underline">Duplicate</button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{product.sku || '—'}</td>
                      <td className="px-4 py-3">
                        {product.type === 'variable' ? (
                          (() => {
                            const totalStock = product.variations?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0
                            return (
                              <span className={`text-sm font-medium ${
                                totalStock === 0 ? 'text-red-600' :
                                totalStock < 10 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                                {totalStock === 0 ? 'Out of stock' :
                                 totalStock < 10 ? `Low: ${totalStock}` :
                                 `${totalStock} units`}
                              </span>
                            )
                          })()
                        ) : (
                          <span className={`text-sm font-medium ${
                            product.stockQuantity === 0 ? 'text-red-600' :
                            product.stockQuantity < 10 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {product.stockQuantity === 0 ? 'Out of stock' :
                             product.stockQuantity < 10 ? `Low: ${product.stockQuantity}` :
                             `${product.stockQuantity} units`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.type === 'variable' ? (
                          <span className="text-xs font-medium text-gray-500">
                            {(product.variations?.length || 0)} variation{(product.variations?.length || 0) === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.salePrice || product.regularPrice || product.price)}</span>
                            {product.salePrice && product.regularPrice && (
                              <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.regularPrice)}</span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{product.categories?.map(c => c.name || c).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{product.tags?.join(', ') || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => toggleFeatured(product)} title={product.featured ? 'Remove from featured' : 'Mark as featured'}>
                          <Star size={14} className={product.featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-gray-400'} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(product.createdAt)}</td>
                    </tr>

                    {/* Quick Edit row */}
                    {quickEdit === product._id && (
                      <tr key={`qe-${product._id}`} className="bg-blue-50/30">
                        <td colSpan={11} className="px-6 py-4 border-b border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Quick Edit</span>
                            <span className="text-xs text-gray-400">— {product.name}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            <div className="lg:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                              <input value={qeForm.name} onChange={e => setQeForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                              <input value={qeForm.sku} onChange={e => setQeForm(f => ({ ...f, sku: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                              <input type="number" value={qeForm.price} onChange={e => setQeForm(f => ({ ...f, price: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price (₹)</label>
                              <input type="number" value={qeForm.salePrice} onChange={e => setQeForm(f => ({ ...f, salePrice: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Stock Qty</label>
                              <input type="number" value={qeForm.stockQuantity} onChange={e => setQeForm(f => ({ ...f, stockQuantity: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                              <select value={qeForm.status} onChange={e => setQeForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="publish">Published</option>
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                              </select>
                            </div>
                            <div className="flex items-end pb-1">
                              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={qeForm.featured} onChange={e => setQeForm(f => ({ ...f, featured: e.target.checked }))}
                                  className="rounded border-gray-300 text-blue-600" />
                                <Star size={13} className="text-yellow-400" /> Featured
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => saveQuickEdit(product._id)} disabled={qeSaving}
                              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors">
                              {qeSaving ? 'Saving…' : 'Update'}
                            </button>
                            <button onClick={() => setQuickEdit(null)}
                              className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom bulk action bar */}
        {!loading && products.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-gray-100">
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Bulk actions</option>
              {bulkActionsList.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
            <Button variant="secondary" size="sm" onClick={handleBulkApply} disabled={!bulkAction || !selected.length}>
              <Check size={13} /> Apply
            </Button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {products.length} of {total} products</p>
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => handleDelete(deleteId)}
        title="Delete Product" message="Are you sure? This action cannot be undone." danger />
      <ConfirmDialog open={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)} onConfirm={handleBulkDelete}
        title={`Delete ${selected.length} Products`} message="This will permanently delete the selected products. This action cannot be undone." danger />
    </div>
  )
}
