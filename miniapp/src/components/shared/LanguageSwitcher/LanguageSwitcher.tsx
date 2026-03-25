import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Icon } from '@/components/ui/Icon/Icon'

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 p-2 rounded-md text-content-muted hover:text-content hover:bg-surface-muted transition-colors"
        aria-label="Change language"
        type="button"
      >
        <Icon name="globe" variant="regular" size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-border bg-surface shadow-md z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-surface-muted transition-colors',
                i18n.language === lang.code ? 'text-primary font-medium' : 'text-content',
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
