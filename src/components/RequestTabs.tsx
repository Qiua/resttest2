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
        return 'text-green-600 dark:text-green-400'
      case 'POST':
        return 'text-blue-600 dark:text-blue-400'
      case 'PUT':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'DELETE':
        return 'text-red-600 dark:text-red-400'
      case 'PATCH':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
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
    <div className='flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 min-h-[48px] overflow-x-auto'>
      {/* Tabs existentes */}
      <div className='flex items-center flex-1 overflow-x-auto'>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              flex items-center min-w-0 max-w-[200px] px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer group
              ${
                activeTabId === tab.id
                  ? 'bg-white dark:bg-gray-900 border-b-2 border-blue-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            onClick={() => onTabSelect(tab.id)}
          >
            {/* Método HTTP */}
            <span className={`text-xs font-bold mr-2 ${getMethodColor(tab.method)}`}>{tab.method}</span>

            {/* Nome da requisição */}
            <span
              className={`
                flex-1 truncate text-sm
                ${activeTabId === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}
              `}
              title={getTabName(tab)}
            >
              {getTabName(tab)}
            </span>

            {/* Indicador de modificação */}
            {tab.isModified && <div className='w-2 h-2 bg-orange-500 rounded-full ml-1 mr-1'></div>}

            {/* Botão de fechar */}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                className={`
                  ml-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                  ${
                    activeTabId === tab.id
                      ? 'hover:bg-gray-200 dark:hover:bg-gray-800'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <FiX className='w-3 h-3' />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botão de nova aba */}
      <button
        onClick={onNewTab}
        className='flex items-center justify-center min-w-[40px] h-[40px] mx-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'
        title={t('tabs.newTab')}
      >
        <FiPlus className='w-4 h-4' />
      </button>
    </div>
  )
}
