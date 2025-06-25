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
// src/components/Sidebar.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiMenu, FiX, FiFolder, FiGlobe, FiLayers, FiClock } from 'react-icons/fi'
import { SettingsMenu } from './SettingsMenu'
import type { Workspace, SavedRequest, Environment } from '../types'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  workspaces: Workspace[]
  activeWorkspace?: string
  onWorkspaceSelect: (workspaceId: string) => void
  onRequestSelect: (request: SavedRequest) => void
  onNewWorkspace: () => void
  onNewCollection: (workspaceId: string) => void
  onNewRequest: (collectionId?: string) => void
  onDeleteCollection: (collectionId: string) => void
  onDeleteRequest: (requestId: string) => void
  onDeleteWorkspace?: (workspaceId: string) => void
  onImportExport?: () => void

  // Settings props
  environments: Environment[]
  activeEnvironmentId: string | null
  onEnvironmentSelect: (environmentId: string | null) => void
  onManageEnvironments: () => void
  onHistoryOpen: () => void
  onProxySettingsOpen: () => void
  onInterfaceSettingsOpen: () => void

  // Workspace panel props
  isWorkspacePanelOpen: boolean
  onWorkspacePanelToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onImportExport,

  // Settings props
  environments,
  activeEnvironmentId,
  onEnvironmentSelect,
  onManageEnvironments,
  onHistoryOpen,
  onProxySettingsOpen,
  onInterfaceSettingsOpen,

  // Workspace panel props
  isWorkspacePanelOpen,
  onWorkspacePanelToggle,
}) => {
  const { t } = useTranslation()

  if (!isOpen) {
    return (
      <div className="w-12 bg-gray-800 dark:bg-gray-900 flex flex-col items-center py-3 gap-2 transition-all duration-300 ease-in-out">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggle}
          className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-200 cursor-pointer"
          title={t('sidebar.openSidebar')}
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Separador */}
        <div className="w-6 h-px bg-gray-600 dark:bg-gray-700"></div>

        {/* History Icon (Tools) */}
        <button
          onClick={onHistoryOpen}
          className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-200 cursor-pointer"
          title={t('history.title')}
        >
          <FiClock className="w-5 h-5" />
        </button>

        {/* Workspace Icon */}
        <button
          onClick={onWorkspacePanelToggle}
          className={`text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-200 cursor-pointer ${
            isWorkspacePanelOpen ? 'bg-blue-600 hover:bg-blue-700' : ''
          }`}
          title={t('sidebar.workspace')}
        >
          <FiFolder className="w-5 h-5" />
        </button>

        {/* Environment Manager Icon */}
        <button
          onClick={onManageEnvironments}
          className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-200 cursor-pointer"
          title={t('environments.title')}
        >
          <FiLayers className="w-5 h-5" />
        </button>

        {/* Interface Settings Icon */}
        <button
          onClick={onInterfaceSettingsOpen}
          className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-200 cursor-pointer"
          title={t('settings.interface')}
        >
          <FiGlobe className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out">
      {/* Header do Sidebar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={onToggle}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
            title={t('sidebar.closeSidebar')}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu de Opções */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Menu de Configurações */}
        <SettingsMenu
          environments={environments}
          activeEnvironmentId={activeEnvironmentId}
          onEnvironmentSelect={onEnvironmentSelect}
          onManageEnvironments={onManageEnvironments}
          onHistoryOpen={onHistoryOpen}
          onProxySettingsOpen={onProxySettingsOpen}
          onImportExportOpen={onImportExport || (() => {})}
        />

        {/* Separador */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
          {/* Botão Workspace */}
          <button
            onClick={onWorkspacePanelToggle}
            className={`w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-colors flex items-center gap-3 ${
              isWorkspacePanelOpen
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <FiFolder className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">{t('sidebar.workspace')}</div>
              <div className="text-xs opacity-75">{isWorkspacePanelOpen ? 'Fechar workspace' : 'Abrir workspace'}</div>
            </div>
          </button>

          {/* Botão Environment Manager */}
          <button
            onClick={onManageEnvironments}
            className="w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-colors flex items-center gap-3 mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
          >
            <FiLayers className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">{t('environments.title')}</div>
              <div className="text-xs opacity-75">Gerenciar ambientes</div>
            </div>
          </button>

          {/* Botão Interface Settings */}
          <button
            onClick={onInterfaceSettingsOpen}
            className="w-full px-3 py-3 text-left text-sm font-medium rounded-lg transition-colors flex items-center gap-3 mt-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
          >
            <FiGlobe className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">{t('settings.interface')}</div>
              <div className="text-xs opacity-75">Configurações da interface</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
