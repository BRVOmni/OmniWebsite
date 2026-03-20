'use client'

/**
 * Language Toggle Component
 *
 * Button to switch between English and Spanish
 */

import { Globe } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { Language } from '@/lib/translations'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{language}</span>
    </button>
  )
}
