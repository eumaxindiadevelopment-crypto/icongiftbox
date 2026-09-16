import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Upload, X, Image, FolderOpen, Save } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const DEFAULT = {
  panel1Image: '', panel1Badge: 'Sale Up to 50% Off',
  panel1Heading: 'Summer', panel1Year: '2024',
  panel1BtnText: 'Shop Now', panel1BtnLink: '/shop',

  panel2Image: '', panel2Badge: 'Sale Up to 50% Off',
  panel2Heading: 'New Summer Collection',
  panel2BtnText: 'Shop Now', panel2BtnLink: '/shop',
}

function ImageField({ label, value, onChange, fileRef, onUpload, uploading, onOpenMedia }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative w-24 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => onChange('')}
              className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-600 hover:text-red-500">
              <X size={11} />
            </button>
          </div>
        ) : (
          <div className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
            <Image size={20} />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50">
              <Upload size={12} />{uploading ? 'Uploading...' : 'Upload New'}
            </button>
            <button onClick={onOpenMedia}
              className="flex items-center gap-1.5 border border-blue-300 text-blue-600 rounded-lg px-3 py-1.5 text-xs hover:bg-blue-50">
              <FolderOpen size={12} />Media Library
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Or paste image URL..."
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export function SummerSalePage() {
  const [form, setForm]       = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState({})
  const [mediaTarget, setMediaTarget] = useState(null)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const p1Ref = useRef()
  const p2Ref = useRef()
  const refs  = { panel1Image: p1Ref, panel2Image: p2Ref }

  useEffect(() => {
    api.get('/summer-sale')
      .then(({ data }) => setForm({ ...DEFAULT, ...data }))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(u => ({ ...u, [field]: true }))
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      set(field, data.url)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(u => ({ ...u, [field]: false }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await api.put('/summer-sale', form)
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Summer Sale Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the two-panel sale banner on the home page</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Panel 1 — Left
            <span className="ml-2 text-xs font-normal text-gray-400">(Sale with year)</span>
          </h2>

          <ImageField
            label="Background Image"
            value={form.panel1Image}
            onChange={v => set('panel1Image', v)}
            fileRef={p1Ref}
            onUpload={handleUpload('panel1Image')}
            uploading={uploading.panel1Image}
            onOpenMedia={() => setMediaTarget('panel1Image')}
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Badge Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.panel1Badge} onChange={e => set('panel1Badge', e.target.value)}
              placeholder="Sale Up to 50% Off" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Heading</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.panel1Heading} onChange={e => set('panel1Heading', e.target.value)}
                placeholder="Summer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year / Sub-text</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.panel1Year} onChange={e => set('panel1Year', e.target.value)}
                placeholder="2024" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.panel1BtnText} onChange={e => set('panel1BtnText', e.target.value)}
                placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.panel1BtnLink} onChange={e => set('panel1BtnLink', e.target.value)}
                placeholder="/shop" />
            </div>
          </div>
        </div>

        {/* Panel 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Panel 2 — Right
            <span className="ml-2 text-xs font-normal text-gray-400">(Collection banner)</span>
          </h2>

          <ImageField
            label="Background Image"
            value={form.panel2Image}
            onChange={v => set('panel2Image', v)}
            fileRef={p2Ref}
            onUpload={handleUpload('panel2Image')}
            uploading={uploading.panel2Image}
            onOpenMedia={() => setMediaTarget('panel2Image')}
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Badge Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.panel2Badge} onChange={e => set('panel2Badge', e.target.value)}
              placeholder="Sale Up to 50% Off" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Heading</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.panel2Heading} onChange={e => set('panel2Heading', e.target.value)}
              placeholder="New Summer Collection" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.panel2BtnText} onChange={e => set('panel2BtnText', e.target.value)}
                placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.panel2BtnLink} onChange={e => set('panel2BtnLink', e.target.value)}
                placeholder="/shop" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> Both panels appear side-by-side on the home page.
        Leave an image blank to keep the default template background. Changes apply instantly after saving.
      </div>

      {/* Media Picker Modal */}
      {mediaTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Media Library</h2>
                <p className="text-xs text-gray-400 mt-0.5">Click an image to select it</p>
              </div>
              <button onClick={() => setMediaTarget(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <MediaPage
                selectionMode={true}
                onSelect={(file) => {
                  set(mediaTarget, file.url)
                  setMediaTarget(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
