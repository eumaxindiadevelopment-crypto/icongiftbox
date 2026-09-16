import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, RemoveFormatting, Undo2, Redo2,
} from 'lucide-react'
import './RichEditor.css'

function Btn({ active, title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="block w-px h-4 bg-gray-200 mx-0.5 shrink-0" />
}

export function RichEditor({ value, onChange, placeholder = 'Write here…', minHeight = 160, label }) {
  const lastValue = useRef(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.getHTML()
      lastValue.current = html
      onChange(html)
    },
  })

  // Sync external value changes (e.g. when edit-mode data loads)
  useEffect(() => {
    if (!editor || value === lastValue.current) return
    lastValue.current = value
    editor.commands.setContent(value || '', false)
  }, [value, editor])

  const setLink = () => {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter URL:', prev || 'https://')
    if (url === null) return
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url.trim() }).run()
  }

  if (!editor) return null

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 size={13} /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 size={13} /></Btn>
          <Sep />
          <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={13} /></Btn>
          <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={13} /></Btn>
          <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={13} /></Btn>
          <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough size={13} /></Btn>
          <Sep />
          <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={13} /></Btn>
          <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"><Heading3 size={13} /></Btn>
          <Sep />
          <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={13} /></Btn>
          <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={13} /></Btn>
          <Sep />
          <Btn active={editor.isActive('link')} onClick={setLink} title="Insert / Edit Link"><LinkIcon size={13} /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting"><RemoveFormatting size={13} /></Btn>
        </div>
        {/* Content area */}
        <EditorContent
          editor={editor}
          className="rich-editor-content"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}
