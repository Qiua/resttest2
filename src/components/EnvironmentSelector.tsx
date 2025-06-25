/*
    REST Test 2.0 - Environment Selector Component
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

// src/components/EnvironmentSelector.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiChevronDown, FiLayers, FiSettings } from 'react-icons/fi'
import type { Environment } from '../types'

interface EnvironmentSelectorProps {
  environments: Environment[]
  activeEnvironmentId: string | null
  onEnvironmentSelect: (environmentId: string | null) => void
  onManageEnvironments: () => void
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  activeEnvironmentId,
  onEnvironmentSelect,
  onManageEnvironments,
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeEnvironment = environments.find(env => env.id === activeEnvironmentId && !env.isGlobal)
  const availableEnvironments = environments.filter(env => !env.isGlobal)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEnvironmentSelect = (environmentId: string | null) => {
    onEnvironmentSelect(environmentId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[180px]"
        title={t('environments.selectEnvironment')}
      >
        <FiLayers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="flex-1 text-left truncate text-gray-900 dark:text-white">
          {activeEnvironment ? activeEnvironment.name : t('environments.noEnvironment')}
        </span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-[100] max-h-64 overflow-auto">
          {/* No Environment Option */}
          <button
            onClick={() => handleEnvironmentSelect(null)}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
              !activeEnvironmentId
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="w-4 h-4" /> {/* Spacer */}
            <span>{t('environments.noEnvironment')}</span>
          </button>

          {/* Environment List */}
          {availableEnvironments.length > 0 ? (
            availableEnvironments.map(env => (
              <button
                key={env.id}
                onClick={() => handleEnvironmentSelect(env.id)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                  activeEnvironmentId === env.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiLayers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{env.name}</div>
                  {env.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{env.description}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{env.variables.length}</div>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('environments.noEnvironmentsAvailable')}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-600" />

          {/* Manage Environments Button */}
          <button
            onClick={() => {
              onManageEnvironments()
              setIsOpen(false)
            }}
            className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
          >
            <FiSettings className="w-4 h-4" />
            <span>{t('environments.manageEnvironments')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
