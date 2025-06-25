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

// src/components/RequestTabs.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiX, FiPlus } from 'react-icons/fi'
import type { RequestTab } from '../types'

interface RequestTabsProps {
  tabs: RequestTab[]
  activeTabId: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

export const RequestTabs: React.FC<RequestTabsProps> = ({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }) => {
  const { t } = useTranslation()

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 border border-green-200 dark:border-green-700'
      case 'POST':
        return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700'
      case 'PUT':
        return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700'
      case 'DELETE':
        return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40 border border-red-200 dark:border-red-700'
      case 'PATCH':
        return 'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600'
    }
  }

  const getTabName = (tab: RequestTab) => {
    if (tab.name && tab.name !== 'Nova Requisição') {
      return tab.name
    }
    if (tab.url && tab.url !== '') {
      try {
        const urlObj = new URL(tab.url)
        return urlObj.hostname || 'Nova Requisição'
      } catch {
        return tab.url.slice(0, 20) + (tab.url.length > 20 ? '...' : '')
      }
    }
    return 'Nova Requisição'
  }

  return (
    <div className='flex items-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600 min-h-[52px] overflow-x-auto shadow-sm dark:shadow-lg'>
      {/* Tabs existentes com melhor design */}
      <div className='flex items-center flex-1 overflow-x-auto'>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center min-w-0 max-w-[220px] px-4 py-3 border-r border-gray-200 dark:border-gray-600 cursor-pointer group transition-all duration-300 relative
              ${
                activeTabId === tab.id
                  ? 'bg-white dark:bg-gray-800 shadow-md border-t-3 border-t-blue-500 dark:border-t-blue-400 -mb-px dark:shadow-xl'
                  : 'hover:bg-white/70 dark:hover:bg-gray-700/80 hover:shadow-sm dark:hover:shadow-md'
              }
            `}
            onClick={() => onTabSelect(tab.id)}
          >
            {/* Método HTTP com melhor styling */}
            <span className={`text-xs font-bold mr-3 px-2 py-1 rounded-md ${getMethodColor(tab.method)} shadow-sm`}>
              {tab.method}
            </span>

            {/* Nome da requisição */}
            <span
              className={`
                flex-1 truncate text-sm font-medium transition-colors duration-200
                ${
                  activeTabId === tab.id
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                }
              `}
              title={getTabName(tab)}
            >
              {getTabName(tab)}
            </span>

            {/* Indicador de modificação melhorado */}
            {tab.isModified && (
              <div className='w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-300 dark:to-orange-400 rounded-full ml-2 mr-1 animate-pulse shadow-sm dark:shadow-orange-500/25'></div>
            )}

            {/* Botão de fechar melhorado */}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                className={`
                  ml-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110
                  ${
                    activeTabId === tab.id
                      ? 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300'
                      : 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-300'
                  }
                `}
                title={t('tabs.closeTab')}
                aria-label={t('tabs.closeTab')}
              >
                <FiX className='w-3 h-3' />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botão de nova aba melhorado */}
      <button
        onClick={onNewTab}
        className='flex items-center justify-center min-w-[44px] h-[44px] mx-3 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-700 shadow-sm hover:shadow-md dark:hover:shadow-blue-500/10 group'
        title={t('tabs.newTab')}
        aria-label={t('tabs.newTab')}
      >
        <FiPlus className='w-5 h-5 group-hover:scale-110 transition-transform duration-200' />
      </button>
    </div>
  )
}
