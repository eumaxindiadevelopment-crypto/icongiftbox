import { useState, useEffect } from 'react'
import { AlertTriangle, Package, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Loading'
import { formatCurrency } from '../../lib/utils'
import api from '../../lib/api'

export function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/products?limit=200')
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data.products || []
        setProducts(items.map(p => {
          const isVariable = p.type === 'variable'
          const stock = isVariable
            ? (p.variations?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0)
            : (typeof p.stockQuantity === 'number' ? p.stockQuantity : (p.stock ?? 0))
          return {
            id: p._id,
            name: p.name,
            sku: p.sku || '—',
            category: p.categories?.[0]?.name || p.categoryName || '—',
            price: p.salePrice || p.price || 0,
            stock,
            variationCount: isVariable ? (p.variations?.length || 0) : 0,
          }
        }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const outOfStock = products.filter(p => p.stock === 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 25)
  const inStock = products.filter(p => p.stock >= 25)

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">In Stock</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{inStock.length}</p>
          <p className="text-xs text-gray-400">products</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Low Stock</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
          <p className="text-xs text-gray-400">products (under 25 units)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Out of Stock</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
          <p className="text-xs text-gray-400">products</p>
        </div>
      </div>

      {(outOfStock.length + lowStock.length) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle size={16} /> Stock Alerts
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...outOfStock, ...lowStock].map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      <span className={p.stock === 0 ? 'text-red-600' : 'text-amber-600'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.stock === 0 ? 'outofstock' : 'lowstock'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Full Inventory</CardTitle>
          <Button variant="secondary" size="sm" onClick={load}><RefreshCw size={13} /> Refresh</Button>
        </CardHeader>
        {products.length === 0 ? (
          <div className="px-5 py-10 text-sm text-gray-400 text-center flex flex-col items-center gap-2">
            <Package size={32} className="text-gray-300" />
            No products found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {p.name}
                      {p.variationCount > 0 && <span className="ml-1.5 text-xs font-normal text-gray-400">({p.variationCount} variations)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      <span className={p.stock === 0 ? 'text-red-600' : p.stock < 25 ? 'text-amber-600' : 'text-emerald-600'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.stock === 0 ? 'outofstock' : p.stock < 25 ? 'lowstock' : 'instock'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
