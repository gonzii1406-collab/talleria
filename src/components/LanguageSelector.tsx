'use client'

import { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  onChange: (l: Locale) => void
}

export default function LanguageSelector({ locale, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {(['es', 'en'] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            locale === l
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {l === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  )
}
