import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react'

const DEFAULT_TABS = [
  { label: 'All', category: 'ALL', categoryId: '' },
]

const DEFAULT = {
  title: 'Most popular products',
  productCount: 8,
  filterTabs: DEFAULT_TABS,
}

export function ProductSectionPage() {
  const [form, setForm]           = useState(DEFAULT)
  const [categories, setCategories] = useState([])
  const [counts, setCounts]       = useState({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [newLabel, setNewLabel]   = useState('')
  const [newCatId, setNewCatId]   = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/product-section-settings'),
      api.get('/categories'),
      api.get('/products?limit=200&status=publish'),
    ]).then(([settings, cats, products]) => {
      const settingsData = settings.data
      setForm({
        ...DEFAULT,
        ...settingsData,
        filterTabs: settingsData.filterTabs?.length ? settingsData.filterTabs : DEFAULT_TABS,
      })
      const catList = Array.isArray(cats.data) ? cats.data : (cats.data?.value || [])
      setCategories(catList)

      // count products per category
      const allProducts = Array.isArray(products.data) ? products.data : (products.data?.products || [])
      const countMap = { ALL: allProducts.length }
      catList.forEach(cat => {
        countMap[cat._id] = allProducts.filter(p =>
          Array.isArray(p.categories) && p.categories.some(c =>
            (c._id || c) === cat._id || (c.name || '') === cat.name
          )
        ).length
      })
      setCounts(countMap)
    }).catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addTab = () => {
    const label = newLabel.trim()
    if (!label) return
    if (newCatId === 'ALL') {
      set('filterTabs', [...form.filterTabs, { label, category: 'ALL', categoryId: '' }])
    } else {
      const cat = categories.find(c => c._id === newCatId)
      set('filterTabs', [...form.filterTabs, {
        label,
        category: cat?.name || newCatId,
        categoryId: newCatId,
      }])
    }
    setNewLabel('')
    setNewCatId('')
  }

  const removeTab = (i) => set('filterTabs', form.filterTabs.filter((_, idx) => idx !== i))

  const updateTabLabel = (i, value) =>
    set('filterTabs', form.filterTabs.map((t, idx) => idx === i ? { ...t, label: value } : t))

  const updateTabCategory = (i, catId) => {
    const cat = categories.find(c => c._id === catId)
    set('filterTabs', form.filterTabs.map((t, idx) =>
      idx === i ? { ...t, category: catId === 'ALL' ? 'ALL' : (cat?.name || catId), categoryId: catId === 'ALL' ? '' : catId } : t
    ))
  }

  const moveTab = (i, dir) => {
    const tabs = [...form.filterTabs]
    const swapIdx = i + dir
    if (swapIdx < 0 || swapIdx >= tabs.length) return
    ;[tabs[i], tabs[swapIdx]] = [tabs[swapIdx], tabs[i]]
    set('filterTabs', tabs)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      await api.put('/product-section-settings', form)
      setSuccess('Saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Product Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the home page product section</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between">
          {error}<button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>
      )}

      {/* Section Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Section Settings</h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Most popular products"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Number of Products to Show</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={form.productCount}
            onChange={e => set('productCount', +e.target.value)}
          >
            <option value={4}>4 products</option>
            <option value={8}>8 products</option>
            <option value={12}>12 products</option>
            <option value={16}>16 products</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Filter Tabs
          <span className="ml-2 text-xs font-normal text-gray-400">({form.filterTabs.length} tabs)</span>
        </h2>

        <div className="space-y-2">
          {form.filterTabs.map((tab, i) => {
            const tabCatId = tab.categoryId || (tab.category === 'ALL' ? 'ALL' : '')
            const count = tab.category === 'ALL' ? counts.ALL : counts[tabCatId] ?? 0
            return (
              <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveTab(i, -1)} disabled={i === 0}
                    className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▲</button>
                  <button onClick={() => moveTab(i, 1)} disabled={i === form.filterTabs.length - 1}
                    className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs">▼</button>
                </div>
                <GripVertical size={14} className="text-gray-300 shrink-0" />

                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-0.5">Tab Label</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={tab.label}
                      onChange={e => updateTabLabel(i, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-0.5">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={tabCatId || 'ALL'}
                      onChange={e => updateTabCategory(i, e.target.value)}
                    >
                      <option value="ALL">All Products ({counts.ALL ?? 0})</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} ({counts[cat._id] ?? 0})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Count badge */}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium shrink-0 min-w-[32px] text-center">
                  {count}
                </span>

                <button onClick={() => removeTab(i)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Add new tab */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Add New Tab</p>
          <div className="flex gap-3">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tab label (e.g. Mugs)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTab()}
            />
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={newCatId}
              onChange={e => setNewCatId(e.target.value)}
            >
              <option value="">— Select Category —</option>
              <option value="ALL">All Products ({counts.ALL ?? 0})</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} ({counts[cat._id] ?? 0})
                </option>
              ))}
            </select>
            <button onClick={addTab}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
              <Plus size={14} /> Add Tab
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> Each tab filters the home page products by the selected category.
        The number badge shows how many published products are in that category.
        Products must have a category assigned to appear in category filters.
      </div>
    </div>
  )
}
