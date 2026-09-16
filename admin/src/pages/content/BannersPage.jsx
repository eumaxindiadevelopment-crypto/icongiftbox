import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, Upload, X, Image, FolderOpen } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  price: '',
  image: '',
  productLink: '/product-default',
  buttonText: 'View Detail',
  sortOrder: 0,
  isActive: true,
}

export function BannersPage() {
  const [banners, setBanners] = useState([])
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
      const { data } = await api.get('/banners?all=true')
      setBanners(data)
    } catch {
      setError('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, sortOrder: banners.length })
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = (b) => {
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      price: b.price || '',
      image: b.image || '',
      productLink: b.productLink || '/product-default',
      buttonText: b.buttonText || 'View Detail',
      sortOrder: b.sortOrder ?? 0,
      isActive: b.isActive ?? true,
    })
    setEditingId(b._id)
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
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, form)
      } else {
        await api.post('/banners', form)
      }
      setSuccess(editingId ? 'Banner updated' : 'Banner created')
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
    if (!window.confirm('Delete this banner?')) return
    try {
      await api.delete(`/banners/${id}`)
      setBanners(prev => prev.filter(b => b._id !== id))
    } catch {
      setError('Delete failed')
    }
  }

  const handleToggle = async (b) => {
    try {
      const { data } = await api.put(`/banners/${b._id}`, { isActive: !b.isActive })
      setBanners(prev => prev.map(x => x._id === b._id ? data : x))
    } catch {
      setError('Update failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Home Banner Slides</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the hero banner slider on the home page</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between">
          {error}<button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
          {success}
        </div>
      )}

      {/* Form Panel */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">{editingId ? 'Edit Slide' : 'Add New Slide'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Product Title *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Premium Gift Hamper"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. For Every Occasion"
                value={form.subtitle}
                onChange={e => set('subtitle', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 499"
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">View Detail Link</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/product-default"
                value={form.productLink}
                onChange={e => set('productLink', e.target.value)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="View Detail"
                value={form.buttonText}
                onChange={e => set('buttonText', e.target.value)}
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

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image</label>
            <div className="flex items-start gap-4">
              {form.image ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                  <img src={form.image} alt="banner" className="w-full h-full object-cover" />
                  <button
                    onClick={() => set('image', '')}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-600 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <Image size={24} />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {uploading ? 'Uploading...' : 'Upload New'}
                  </button>
                  <button
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 border border-blue-300 text-blue-600 rounded-lg px-3 py-2 text-sm hover:bg-blue-50"
                  >
                    <FolderOpen size={14} />
                    Choose from Media
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <p className="text-xs text-gray-400">Or paste image URL directly:</p>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://... or /uploads/..."
                  value={form.image}
                  onChange={e => set('image', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700">Active</label>
            <button onClick={() => set('isActive', !form.isActive)}>
              {form.isActive
                ? <ToggleRight size={28} className="text-blue-600" />
                : <ToggleLeft size={28} className="text-gray-400" />
              }
            </button>
            <span className="text-xs text-gray-500">{form.isActive ? 'Visible on homepage' : 'Hidden'}</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Slide' : 'Create Slide'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="border border-gray-300 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <Image size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No banner slides yet.</p>
          <button onClick={openAdd}
            className="mt-3 text-blue-600 text-sm font-medium hover:underline">
            Add your first slide →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, idx) => (
            <div key={b._id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              {/* Drag handle visual */}
              <GripVertical size={16} className="text-gray-300 shrink-0" />

              {/* Image Preview */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {b.image
                  ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300"><Image size={20} /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{b.title}</p>
                {b.subtitle && <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>}
                <div className="flex items-center gap-3 mt-1">
                  {b.price && <span className="text-xs font-medium text-blue-600">₹{b.price}</span>}
                  <span className="text-xs text-gray-400">{b.productLink}</span>
                </div>
              </div>

              {/* Order Badge */}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono shrink-0">
                #{b.sortOrder}
              </span>

              {/* Active Toggle */}
              <button onClick={() => handleToggle(b)} title={b.isActive ? 'Active – click to hide' : 'Inactive – click to show'}>
                {b.isActive
                  ? <ToggleRight size={24} className="text-green-500" />
                  : <ToggleLeft size={24} className="text-gray-300" />
                }
              </button>

              {/* Actions */}
              <button onClick={() => openEdit(b)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(b._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> Each active slide appears in the home page hero banner.
        The left slider shows the product <strong>title</strong> and <strong>price</strong>.
        The right slider shows the <strong>banner image</strong>.
        Clicking "View Detail" navigates to the <strong>product link</strong>.
        Inactive slides are hidden from the website but kept here for later use.
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click an image to use it as the banner image</p>
              </div>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            {/* Media Library */}
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
