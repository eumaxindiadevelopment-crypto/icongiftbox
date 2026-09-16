import { Heart } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
      <p className="flex items-center gap-1">
        Made with <Heart size={12} className="text-red-400 fill-red-400" /> by Corporate Gifts &mdash; &copy; {year} All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
          View Website
        </a>
        <a href="mailto:support@corporategifts.in" className="hover:text-blue-600 transition-colors">
          Support
        </a>
        <span className="text-gray-300">Admin v1.0.0</span>
      </div>
    </footer>
  )
}
