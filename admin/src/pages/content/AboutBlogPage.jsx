import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Upload, X, Image, FolderOpen, Save } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const DEFAULT = {
  mainImage: '', mainBtnText: 'Woman collection', mainBtnLink: '/shop',
  title: 'Set your wardrobe with our amazing selection!',
  description: '',
  aboutLink: '/about-us',
  card1Image: '', card1BtnText: 'Child Fashion', card1Link: '/shop',
  card2Image: '', card2BtnText: 'Man collection', card2Link: '/shop',
  card2Badge: '50% Sale',
}

function ImageField({ label, value, onChange, fileRef, onUpload, uploading, onOpenMedia }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => onChange('')}
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
            <button onClick={onOpenMedia}
              className="flex items-center gap-2 border border-blue-300 text-blue-600 rounded-lg px-3 py-2 text-sm hover:bg-blue-50">
              <FolderOpen size={14} />Choose from Media
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <p className="text-xs text-gray-400">Or paste image URL:</p>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="http://localhost:5000/uploads/..."
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export function AboutBlogPage() {
  const [form, setForm] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({})
  const [mediaTarget, setMediaTarget] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const mainRef  = useRef()
  const card1Ref = useRef()
  const card2Ref = useRef()

  const refs = { mainImage: mainRef, card1Image: card1Ref, card2Image: card2Ref }

  useEffect(() => {
    api.get('/about-section')
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
      await api.put('/about-section', form)
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
          <h1 className="text-xl font-semibold text-gray-900">About Blog Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the About section displayed on the home page</p>
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

      {/* Section Text */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Section Text</h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">About Us Link URL</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/about-us"
            value={form.aboutLink}
            onChange={e => set('aboutLink', e.target.value)}
          />
        </div>
      </div>

      {/* Main Image */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Main Image (Left)</h2>
        <ImageField
          label="Main Image"
          value={form.mainImage}
          onChange={v => set('mainImage', v)}
          fileRef={mainRef}
          onUpload={handleUpload('mainImage')}
          uploading={uploading.mainImage}
          onOpenMedia={() => setMediaTarget('mainImage')}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Woman collection"
              value={form.mainBtnText}
              onChange={e => set('mainBtnText', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/shop"
              value={form.mainBtnLink}
              onChange={e => set('mainBtnLink', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Card 1 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Card 1 (Bottom Left)</h2>
        <ImageField
          label="Card 1 Image"
          value={form.card1Image}
          onChange={v => set('card1Image', v)}
          fileRef={card1Ref}
          onUpload={handleUpload('card1Image')}
          uploading={uploading.card1Image}
          onOpenMedia={() => setMediaTarget('card1Image')}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Child Fashion"
              value={form.card1BtnText}
              onChange={e => set('card1BtnText', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/shop"
              value={form.card1Link}
              onChange={e => set('card1Link', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Card 2 (Bottom Right)</h2>
        <ImageField
          label="Card 2 Image"
          value={form.card2Image}
          onChange={v => set('card2Image', v)}
          fileRef={card2Ref}
          onUpload={handleUpload('card2Image')}
          uploading={uploading.card2Image}
          onOpenMedia={() => setMediaTarget('card2Image')}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Man collection"
              value={form.card2BtnText}
              onChange={e => set('card2BtnText', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/shop"
              value={form.card2Link}
              onChange={e => set('card2Link', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sale Badge Text <span className="text-gray-400 font-normal">(leave blank to hide)</span></label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="50% Sale"
            value={form.card2Badge}
            onChange={e => set('card2Badge', e.target.value)}
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> Changes are reflected instantly on the home page after saving.
        Leave any image blank to keep the default template image.
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
