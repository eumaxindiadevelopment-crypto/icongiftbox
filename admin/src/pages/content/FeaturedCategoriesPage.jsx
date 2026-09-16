import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, Upload, X, Image, FolderOpen } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const EMPTY_FORM = {
  name: '',
  image: '',
  url: '/shop',
  sortOrder: 0,
  isActive: true,
}

export function FeaturedCategoriesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/featured-categories?all=true')
      setItems(data)
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, sortOrder: items.length })
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      image: item.image || '',
      url: item.url || '/shop',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
    })
    setEditingId(item._id)
    setShowForm(true)
    setError('')
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      set('image', data.url)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await api.put(`/featured-categories/${editingId}`, form)
      } else {
        await api.post('/featured-categories', form)
      }
      setSuccess(editingId ? 'Updated' : 'Created')
      setShowForm(false)
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await api.delete(`/featured-categories/${id}`)
      setItems(prev => prev.filter(x => x._id !== id))
    } catch {
      setError('Delete failed')
    }
  }

  const handleToggle = async (item) => {
    try {
      const { data } = await api.put(`/featured-categories/${item._id}`, { isActive: !item.isActive })
      setItems(prev => prev.map(x => x._id === item._id ? data : x))
    } catch {
      setError('Update failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Featured Category Slider</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the category slider shown on the home page</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Category
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

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Gift Hampers"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Custom URL</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/shop"
                value={form.url}
                onChange={e => set('url', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.sortOrder}
                onChange={e => set('sortOrder', +e.target.value)}
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category Image</label>
            <div className="flex items-start gap-4">
              {form.image ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={() => set('image', '')}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-600 hover:text-red-500">
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <Image size={22} />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
                    <Upload size={14} />{uploading ? 'Uploading...' : 'Upload New'}
                  </button>
                  <button onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 border border-blue-300 text-blue-600 rounded-lg px-3 py-2 text-sm hover:bg-blue-50">
                    <FolderOpen size={14} />Choose from Media
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <p className="text-xs text-gray-400">Or paste image URL:</p>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:5000/uploads/..."
                  value={form.image}
                  onChange={e => set('image', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700">Active</label>
            <button onClick={() => set('isActive', !form.isActive)}>
              {form.isActive
                ? <ToggleRight size={28} className="text-blue-600" />
                : <ToggleLeft size={28} className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">{form.isActive ? 'Visible on homepage' : 'Hidden'}</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="border border-gray-300 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <Image size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No categories yet.</p>
          <button onClick={openAdd} className="mt-3 text-blue-600 text-sm font-medium hover:underline">
            Add your first category →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <GripVertical size={16} className="text-gray-300 shrink-0" />

              {/* Image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300"><Image size={18} /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400 truncate">{item.url}</p>
              </div>

              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono shrink-0">
                #{item.sortOrder}
              </span>

              <button onClick={() => handleToggle(item)}>
                {item.isActive
                  ? <ToggleRight size={24} className="text-green-500" />
                  : <ToggleLeft size={24} className="text-gray-300" />}
              </button>

              <button onClick={() => openEdit(item)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(item._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> Each active category appears as a card in the home page category slider.
        Set a <strong>custom URL</strong> to link directly to a filtered shop page or any page on the site.
        Inactive items are hidden from the website.
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click an image to use it as the category image</p>
              </div>
              <button onClick={() => setShowMediaPicker(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <MediaPage
                selectionMode={true}
                onSelect={(file) => {
                  set('image', file.url)
                  setShowMediaPicker(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
