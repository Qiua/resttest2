/*
    REST Test 2.0 - Settings Menu Component
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

// src/components/SettingsMenu.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiGlobe,
  FiClock,
  FiShield,
  FiLayers,
  FiExternalLink,
} from 'react-icons/fi'
import { LanguageSelector } from './LanguageSelector'
import { ThemeToggle } from './ThemeToggle'
import { EnvironmentSelector } from './EnvironmentSelector'
import type { Environment } from '../types'

interface SettingsMenuProps {
  // Environment props
  environments: Environment[]
  activeEnvironmentId: string | null
  onEnvironmentSelect: (environmentId: string | null) => void
  onManageEnvironments: () => void

  // Settings props
  onHistoryOpen: () => void
  onProxySettingsOpen: () => void
  onImportExportOpen: () => void
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  environments,
  activeEnvironmentId,
  onEnvironmentSelect,
  onManageEnvironments,
  onHistoryOpen,
  onProxySettingsOpen,
  onImportExportOpen,
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-3">
      {/* Header do Menu de Configurações */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <FiSettings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{t('settings.title')}</span>
        </div>
        {isExpanded ? (
          <FiChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <FiChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </div>

      {/* Conteúdo do Menu de Configurações */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3 space-y-4">
          {/* Seção de Ambientes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FiLayers className="w-4 h-4" />
              <span>{t('environments.title')}</span>
            </div>
            <div className="pl-6">
              <EnvironmentSelector
                environments={environments}
                activeEnvironmentId={activeEnvironmentId}
                onEnvironmentSelect={onEnvironmentSelect}
                onManageEnvironments={onManageEnvironments}
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-600"></div>

          {/* Seção de Interface */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FiGlobe className="w-4 h-4" />
              <span>{t('settings.interface')}</span>
            </div>

            <div className="pl-6 space-y-3">
              {/* Seletor de Idioma */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.language')}</span>
                <LanguageSelector />
              </div>

              {/* Toggle de Tema */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.theme')}</span>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-600"></div>

          {/* Seção de Ferramentas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FiShield className="w-4 h-4" />
              <span>{t('settings.tools')}</span>
            </div>

            <div className="pl-6 space-y-2">
              {/* Histórico de Requisições */}
              <button
                onClick={onHistoryOpen}
                className="w-full flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  <span>{t('history.title')}</span>
                </div>
              </button>

              {/* Configurações de Proxy */}
              <button
                onClick={onProxySettingsOpen}
                className="w-full flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  <span>{t('proxy.settings')}</span>
                </div>
              </button>

              {/* Import/Export */}
              <button
                onClick={onImportExportOpen}
                className="w-full flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiExternalLink className="w-4 h-4" />
                  <span>{t('importExport.title')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
