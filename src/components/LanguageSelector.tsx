'use client'

import { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  onChange: (l: Locale) => void
}

export default function LanguageSelector({ locale, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {(['es', 'en'] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            locale === l
              ? 'text-white/90'
              : 'text-white/30 hover:text-white/60'
          }`}
        >
          {l === 'es' ? 'ES' : 'EN'}
        </button>
      ))}
    </div>
  )
}
