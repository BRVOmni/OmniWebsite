'use client'

/**
 * Language Context
 *
 * Provides language state and translations throughout the app
 */

import { createContext, useContext, useState, ReactNode } from 'react'
import { translations, Language, TranslationKey } from '@/lib/translations'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    const dict = translations[language] as unknown as Record<string, string>
    const fallback = translations.en as unknown as Record<string, string>
    return dict[key] || fallback[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
