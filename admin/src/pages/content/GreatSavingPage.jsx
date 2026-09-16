import { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { Upload, X, Image, FolderOpen, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { MediaPage } from '../media/MediaPage'

const DEFAULT_CARDS = [
  { name: 'Athletic Mesh Sports Leggings', image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: false },
  { name: 'Athletic Mesh Sports Leggings', image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: true  },
  { name: 'Athletic Mesh Sports Leggings', image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: false },
  { name: 'Athletic Mesh Sports Leggings', image: '', saleTitle: 'up to 79% off', price: '80', originalPrice: '95', link: '/shop', showBadge: false },
]

const DEFAULT = {
  bannerImage: '', title: 'Great saving on everyday essentials',
  subtitle: 'Up to 60% off + up to ₹107 cashback',
  btnText: 'See all', btnLink: '/shop', animationText: 'Great saving',
  cards: DEFAULT_CARDS,
}

function ImagePicker({ label, value, onChange, fileRef, onUpload, uploading, onOpenMedia }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => onChange('')}
              className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500">
              <X size={10} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
            <Image size={18} />
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50">
              <Upload size={10} />{uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={onOpenMedia}
              className="flex items-center gap-1 border border-blue-300 text-blue-600 rounded px-2 py-1 text-xs hover:bg-blue-50">
              <FolderOpen size={10} />Media
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <input
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Or paste URL..."
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export function GreatSavingPage() {
  const [form, setForm]           = useState(DEFAULT)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState({})
  const [mediaTarget, setMediaTarget] = useState(null)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  const bannerRef = useRef()
  const cardRefs  = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    api.get('/great-saving')
      .then(({ data }) => setForm({ ...DEFAULT, ...data, cards: data.cards?.length ? data.cards : DEFAULT_CARDS }))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setCard = (i, k, v) => setForm(f => ({
    ...f,
    cards: f.cards.map((c, idx) => idx === i ? { ...c, [k]: v } : c),
  }))

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(u => ({ ...u, [field]: true }))
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (field === 'bannerImage') set('bannerImage', data.url)
      else setCard(parseInt(field.split('-')[1]), 'image', data.url)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(u => ({ ...u, [field]: false }))
    }
  }

  const handleMediaSelect = (file) => {
    if (mediaTarget === 'bannerImage') set('bannerImage', file.url)
    else setCard(parseInt(mediaTarget.split('-')[1]), 'image', file.url)
    setMediaTarget(null)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await api.put('/great-saving', form)
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
          <h1 className="text-xl font-semibold text-gray-900">Great Saving Section</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the sale banner and product cards on the home page</p>
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

      {/* Right Banner Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Right Banner Panel</h2>

        <ImagePicker
          label="Banner Background Image"
          value={form.bannerImage}
          onChange={v => set('bannerImage', v)}
          fileRef={bannerRef}
          onUpload={handleUpload('bannerImage')}
          uploading={uploading.bannerImage}
          onOpenMedia={() => setMediaTarget('bannerImage')}
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Great saving on everyday essentials" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
            placeholder="Up to 60% off + up to ₹107 cashback" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.btnText} onChange={e => set('btnText', e.target.value)} placeholder="See all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.btnLink} onChange={e => set('btnLink', e.target.value)} placeholder="/shop" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Animation Text</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.animationText} onChange={e => set('animationText', e.target.value)} placeholder="Great saving" />
          </div>
        </div>
      </div>

      {/* 4 Product Cards */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Product Cards
          <span className="ml-2 text-xs font-normal text-gray-400">(4 cards on the left side)</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {form.cards.map((card, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Card {i + 1}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">50% Sale Badge</span>
                  <button onClick={() => setCard(i, 'showBadge', !card.showBadge)}>
                    {card.showBadge
                      ? <ToggleRight size={22} className="text-blue-600" />
                      : <ToggleLeft size={22} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <ImagePicker
                label={null}
                value={card.image}
                onChange={v => setCard(i, 'image', v)}
                fileRef={cardRefs[i]}
                onUpload={handleUpload(`card-${i}`)}
                uploading={uploading[`card-${i}`]}
                onOpenMedia={() => setMediaTarget(`card-${i}`)}
              />

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={card.name} onChange={e => setCard(i, 'name', e.target.value)} placeholder="Product name" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sale Label</label>
                  <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={card.saleTitle} onChange={e => setCard(i, 'saleTitle', e.target.value)} placeholder="up to 79% off" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={card.price} onChange={e => setCard(i, 'price', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Original (₹)</label>
                  <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={card.originalPrice} onChange={e => setCard(i, 'originalPrice', e.target.value)} placeholder="95" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Link</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={card.link} onChange={e => setCard(i, 'link', e.target.value)} placeholder="/shop" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>How it works:</strong> 4 product cards appear on the left, the banner on the right.
        Toggle the <strong>50% Sale Badge</strong> on any card to show/hide the badge. Changes apply instantly after saving.
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
              <MediaPage selectionMode={true} onSelect={handleMediaSelect} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
