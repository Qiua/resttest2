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

// src/components/ThemeToggle.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../hooks/useTheme'

export const ThemeToggle: React.FC = () => {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className='p-2.5 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 border border-gray-200 dark:border-gray-500 hover:border-blue-300 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group shadow-sm hover:shadow-md'
      title={theme === 'light' ? t('theme.dark') : t('theme.light')}
      aria-label={theme === 'light' ? t('theme.dark') : t('theme.light')}
    >
      {theme === 'light' ? (
        <FiMoon className='w-4 h-4 group-hover:scale-110 transition-transform duration-300' />
      ) : (
        <FiSun className='w-4 h-4 group-hover:scale-110 group-hover:rotate-45 transition-all duration-300' />
      )}
    </button>
  )
}
