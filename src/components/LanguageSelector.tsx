/*
    REST Test 2.0
    Copyright (C) 2025  Andrey Aires @ Gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
// src/components/LanguageSelector.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiChevronDown, FiGlobe } from 'react-icons/fi'
// Bandeiras disponíveis - adicione novas importações aqui
import { BR } from 'country-flag-icons/react/3x2'
import { US } from 'country-flag-icons/react/3x2'
// import { ES } from 'country-flag-icons/react/3x2' // Para espanhol
// import { FR } from 'country-flag-icons/react/3x2' // Para francês
// import { DE } from 'country-flag-icons/react/3x2' // Para alemão

interface Language {
  code: string
  name: string
  flagCode: string
  FlagComponent: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

// Configuração de idiomas - adicione novos idiomas aqui
const languages: Language[] = [
  {
    code: 'pt',
    name: 'Português',
    flagCode: 'BR',
    FlagComponent: BR,
  },
  {
    code: 'en',
    name: 'English',
    flagCode: 'US',
    FlagComponent: US,
  },
  // Adicione novos idiomas seguindo o padrão:
  // {
  //   code: 'es',
  //   name: 'Español',
  //   flagCode: 'ES',
  //   FlagComponent: ES,
  // },
]

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
        title={t('language.select')}
      >
        <FiGlobe className='w-4 h-4 text-gray-600 dark:text-gray-400' />
        <currentLanguage.FlagComponent
          style={{
            width: '20px',
            height: '15px',
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        />
        <span className='text-gray-700 dark:text-gray-300 hidden sm:block'>{currentLanguage.name}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className='absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 overflow-hidden'>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                currentLanguage.code === language.code
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <language.FlagComponent
                style={{
                  width: '20px',
                  height: '15px',
                  borderRadius: '2px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              />
              <span className='font-medium'>{language.name}</span>
              {currentLanguage.code === language.code && (
                <span className='ml-auto text-blue-600 dark:text-blue-400'>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
