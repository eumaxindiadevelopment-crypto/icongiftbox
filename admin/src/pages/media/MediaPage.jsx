import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Grid, List, Upload, Search, Trash2, Copy, Check,
  Image, X, ChevronLeft, ChevronRight, Download,
  FileVideo, FileText, Presentation, File as FileIcon
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Loading'
import { ConfirmDialog } from '../../components/ui/Modal'
import { cn } from '../../lib/utils'
import api from '../../lib/api'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// 'image' | 'video' | 'pdf' | 'ppt' | 'other' — drives which thumbnail/preview
// widget a file gets, since only images can render as a plain <img>.
function getFileKind(ext) {
  const e = (ext || '').toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'avif'].includes(e)) return 'image'
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv', 'ogg'].includes(e)) return 'video'
  if (e === 'pdf') return 'pdf'
  if (['ppt', 'pptx'].includes(e)) return 'ppt'
  return 'other'
}

const FILE_KIND_STYLE = {
  video: { icon: FileVideo, className: 'bg-purple-50 text-purple-400' },
  pdf: { icon: FileText, className: 'bg-red-50 text-red-400' },
  ppt: { icon: Presentation, className: 'bg-orange-50 text-orange-400' },
  other: { icon: FileIcon, className: 'bg-gray-100 text-gray-400' },
}

function FileThumb({ file, className }) {
  const kind = getFileKind(file.ext)
  if (kind === 'image') {
    return <img src={file.url} alt={file.altText || file.filename} className={className} loading="lazy" />
  }
  const { icon: Icon, className: kindClassName } = FILE_KIND_STYLE[kind]
  return (
    <div className={cn(className, 'flex items-center justify-center', kindClassName)}>
      <Icon size={kind === 'other' ? 20 : 36} />
    </div>
  )
}

export function MediaPage({ selectionMode = false, onSelect }) {
  const [files, setFiles] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')         // 'grid' | 'list'
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState([])
  const [bulkMode, setBulkMode] = useState(false)   // grid-view only — list view's checkboxes are always on
  const [preview, setPreview] = useState(null)      // file object for the attachment-details panel
  const [deleteIds, setDeleteIds] = useState([])    // filenames pending delete
  const [copiedUrl, setCopiedUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [savingField, setSavingField] = useState('') // field name currently being persisted
  const [savedField, setSavedField] = useState('')   // field name that just saved (for the checkmark flash)
  const fileInputRef = useRef()
  const saveTimers = useRef({})

  // Title / Alt Text / Caption / Description are saved per-field, debounced
  // while typing (like WordPress' attachment details screen) rather than
  // requiring an explicit Save button.
  const updatePreviewField = (field, value) => {
    setPreview(p => (p ? { ...p, [field]: value } : p))
    clearTimeout(saveTimers.current[field])
    saveTimers.current[field] = setTimeout(() => saveField(field, value), 600)
  }

  const saveField = async (field, value) => {
    const filename = preview?.filename
    if (!filename) return
    setSavingField(field)
    try {
      await api.patch(`/upload/${filename}`, { [field]: value })
      setFiles(fs => fs.map(f => f.filename === filename ? { ...f, [field]: value } : f))
      setSavedField(field)
      setTimeout(() => setSavedField(f => (f === field ? '' : f)), 1500)
    } catch {} finally {
      setSavingField(f => (f === field ? '' : f))
    }
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const params = new URLSearchParams({ page, limit: 40 })
      if (search) params.set('search', search)
      const { data } = await api.get(`/upload?${params}`)
      setFiles(data.files || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (err) {
      setFiles([])
      setFetchError(err.response?.data?.message || err.response?.data?.error || 'Failed to load media files')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  // Upload handler — accepts File[]
  const handleUpload = async (fileList) => {
    if (!fileList?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(fileList)) {
        const fd = new FormData()
        fd.append('image', file)
        await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setPage(1)
      fetchFiles()
    } catch {}
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const toggleSelect = (filename) => {
    setSelected(s => s.includes(filename) ? s.filter(f => f !== filename) : [...s, filename])
  }

  const toggleBulkMode = () => {
    setBulkMode(b => !b)
    setSelected([])
  }

  const handleDelete = async (filenames) => {
    try {
      await Promise.all(filenames.map(fn => api.delete(`/upload/${fn}`)))
      setSelected([])
      setDeleteIds([])
      if (preview && filenames.includes(preview.filename)) setPreview(null)
      fetchFiles()
    } catch {}
  }

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(''), 2000)
  }

  // Navigate lightbox
  const lightboxNav = (dir) => {
    const idx = files.findIndex(f => f.filename === preview?.filename)
    const next = files[idx + dir]
    if (next) setPreview(next)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <p className="text-sm text-gray-400">{total} files</p>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={cn('p-1.5', view === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50')}>
              <Grid size={15} />
            </button>
            <button onClick={() => setView('list')} className={cn('p-1.5', view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50')}>
              <List size={15} />
            </button>
          </div>

          {!selectionMode && view === 'grid' && (
            <button
              onClick={toggleBulkMode}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg border',
                bulkMode ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              )}
            >
              {bulkMode ? 'Cancel' : 'Bulk select'}
            </button>
          )}

          {bulkMode && view === 'grid' && files.length > 0 && (
            <button
              onClick={() => setSelected(selected.length === files.length ? [] : files.map(f => f.filename))}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              {selected.length === files.length ? 'Deselect All' : 'Select All'}
            </button>
          )}

          {selected.length > 0 && (
            <button
              onClick={() => setDeleteIds(selected)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={13} /> Delete ({selected.length})
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.ppt,.pptx" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner size="sm" /> : <Upload size={14} />}
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'border-2 border-dashed rounded-xl px-4 py-3 text-center text-sm transition-colors',
          dragOver ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'
        )}
      >
        <Upload size={16} className="inline mr-2" />
        Drag &amp; drop images, videos, PDFs or PPTs here to upload
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
          <Image size={48} className="text-red-200" />
          <p className="text-sm font-medium text-red-500">Could not load media</p>
          <p className="text-xs text-red-400">{fetchError}</p>
          <button onClick={fetchFiles} className="mt-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
          <Image size={48} className="text-gray-200" />
          <p className="text-sm font-medium text-gray-500">No media files yet</p>
          <p className="text-xs">Upload images to get started</p>
        </div>
      ) : view === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {files.map(file => {
            const isSelected = selected.includes(file.filename)
            return (
              <div
                key={file.filename}
                className={cn(
                  'group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all',
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
                )}
                onClick={() => {
                  if (bulkMode) return toggleSelect(file.filename)
                  return setPreview(file)
                }}
              >
                <div className="aspect-square bg-gray-100">
                  <FileThumb file={file} className="w-full h-full object-cover" />
                </div>

                {/* Checkbox — always visible in bulk-select mode, otherwise on hover */}
                {!selectionMode && (
                  <div
                    className={cn(
                      'absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : cn('bg-white/80 border-gray-300', !bulkMode && 'opacity-0 group-hover:opacity-100')
                    )}
                    onClick={e => { e.stopPropagation(); toggleSelect(file.filename) }}
                  >
                    {isSelected && <Check size={11} className="text-white" />}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />

                {/* File type badge */}
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded">
                  {file.ext}
                </span>

                {/* Selection-mode hint — clicking opens the attachment details panel below, not an instant pick */}
                {selectionMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-600/0 hover:bg-blue-600/20 transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg font-medium">View details</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="pl-4 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === files.length && files.length > 0}
                    onChange={() => setSelected(selected.length === files.length ? [] : files.map(f => f.filename))}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">File</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Uploaded</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map(file => (
                <tr key={file.filename} className="hover:bg-gray-50/50 transition-colors">
                  <td className="pl-4 pr-2 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(file.filename)}
                      onChange={() => toggleSelect(file.filename)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="cursor-pointer hover:opacity-80" onClick={() => setPreview(file)}>
                        <FileThumb file={file} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                      </div>
                      <span className="text-sm text-gray-700 font-mono truncate max-w-[180px]">{file.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{file.ext}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{formatBytes(file.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{formatDate(file.uploadedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {selectionMode ? (
                        <button
                          onClick={() => setPreview(file)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          View
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => copyUrl(file.url)}
                            title="Copy URL"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            {copiedUrl === file.url ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                          <a href={file.url} download className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                            <Download size={14} />
                          </a>
                          <button
                            onClick={() => setDeleteIds([file.filename])}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">Page {page} of {pages} · {total} files</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Attachment details — WordPress-style: image + metadata form side by side */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="text-sm font-medium text-gray-700 font-mono truncate">{preview.filename}</p>
              <button onClick={() => setPreview(null)} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {/* Left: image preview + nav */}
              <div className="relative bg-gray-50 flex items-center justify-center md:w-1/2 shrink-0" style={{ minHeight: 320 }}>
                <button
                  onClick={() => lightboxNav(-1)}
                  className="absolute left-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30"
                  disabled={files.findIndex(f => f.filename === preview.filename) === 0}
                >
                  <ChevronLeft size={18} />
                </button>

                {getFileKind(preview.ext) === 'image' ? (
                  <img
                    src={preview.url}
                    alt={preview.altText || preview.filename}
                    className="max-h-96 max-w-full object-contain p-4"
                  />
                ) : getFileKind(preview.ext) === 'video' ? (
                  <video src={preview.url} controls className="max-h-96 max-w-full p-4" />
                ) : getFileKind(preview.ext) === 'pdf' ? (
                  <iframe src={preview.url} title={preview.filename} className="w-full h-full border-0" style={{ minHeight: 320 }} />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 p-8">
                    {(() => { const { icon: Icon } = FILE_KIND_STYLE[getFileKind(preview.ext)]; return <Icon size={48} /> })()}
                    <p className="text-sm">Preview not available for this file type</p>
                    <a href={preview.url} download className="text-sm text-blue-600 hover:underline">Download to view</a>
                  </div>
                )}

                <button
                  onClick={() => lightboxNav(1)}
                  className="absolute right-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30"
                  disabled={files.findIndex(f => f.filename === preview.filename) === files.length - 1}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Right: SEO metadata form */}
              <div className="p-4 md:w-1/2 space-y-3">
                <div className="text-xs text-gray-500 space-y-0.5 pb-2 border-b border-gray-100">
                  <p><span className="font-medium">Size:</span> {formatBytes(preview.size)}</p>
                  <p><span className="font-medium">Uploaded:</span> {formatDate(preview.uploadedAt)}</p>
                  <p className="font-mono text-[11px] text-gray-400 break-all">{preview.url}</p>
                </div>

                <Input
                  label="Title"
                  value={preview.title || ''}
                  onChange={e => updatePreviewField('title', e.target.value)}
                  placeholder="Image title"
                />
                {getFileKind(preview.ext) === 'image' && (
                  <Input
                    label={
                      <span className="flex items-center gap-1.5">
                        Alt Text
                        {savingField === 'altText' && <span className="text-[11px] text-gray-400">Saving…</span>}
                        {savedField === 'altText' && <Check size={12} className="text-green-500" />}
                      </span>
                    }
                    value={preview.altText || ''}
                    onChange={e => updatePreviewField('altText', e.target.value)}
                    placeholder="Describe this image for screen readers & SEO"
                  />
                )}
                <Textarea
                  label="Caption"
                  rows={2}
                  value={preview.caption || ''}
                  onChange={e => updatePreviewField('caption', e.target.value)}
                  placeholder="Shown under the image, where the theme supports it"
                />
                <Textarea
                  label="Description"
                  rows={3}
                  value={preview.description || ''}
                  onChange={e => updatePreviewField('description', e.target.value)}
                  placeholder="Longer internal notes about this image"
                />
                {(savingField === 'title' || savingField === 'caption' || savingField === 'description') && (
                  <p className="text-[11px] text-gray-400">Saving…</p>
                )}

                <div className="flex gap-2 pt-2">
                  {selectionMode ? (
                    <button
                      onClick={() => onSelect?.(preview)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Check size={13} /> Select this image
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => copyUrl(preview.url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        {copiedUrl === preview.url ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                        {copiedUrl === preview.url ? 'Copied!' : 'Copy URL'}
                      </button>
                      <a href={preview.url} download className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
                        <Download size={13} /> Download
                      </a>
                      <button
                        onClick={() => { setDeleteIds([preview.filename]); setPreview(null) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteIds.length > 0}
        onClose={() => setDeleteIds([])}
        onConfirm={() => handleDelete(deleteIds)}
        title={`Delete ${deleteIds.length > 1 ? `${deleteIds.length} files` : 'file'}`}
        message="This will permanently delete the selected image(s). This cannot be undone."
        danger
      />
    </div>
  )
}
