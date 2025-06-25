/*
    REST Test 2.0 - Workspace Panel Component
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

// src/components/WorkspacePanel.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlus, FiFolderPlus, FiFolder, FiFile, FiTrash2, FiChevronRight, FiX, FiExternalLink } from 'react-icons/fi'
import type { Workspace, SavedRequest } from '../types'

interface WorkspacePanelProps {
  isOpen: boolean
  onClose: () => void
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
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspace,
  onWorkspaceSelect,
  onRequestSelect,
  onNewWorkspace,
  onNewCollection,
  onNewRequest,
  onDeleteCollection,
  onDeleteRequest,
  onDeleteWorkspace,
  onImportExport,
}) => {
  const { t } = useTranslation()
  const [expandedCollections, setExpandedCollections] = useState<string[]>([])

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev =>
      prev.includes(collectionId) ? prev.filter(id => id !== collectionId) : [...prev, collectionId],
    )
  }

  const activeWorkspaceData = workspaces.find(w => w.id === activeWorkspace)

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
      case 'POST':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
      case 'PUT':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
      case 'DELETE':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
      case 'PATCH':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out">
      {/* Header do Workspace Panel */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sidebar.collections')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
            title={t('sidebar.closeWorkspace')}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Workspace */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('sidebar.workspace')}</label>
            <div className="flex items-center gap-1">
              {onImportExport && (
                <button
                  onClick={onImportExport}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                  title={t('importExport.title')}
                >
                  <FiExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onNewWorkspace}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer"
                title={t('sidebar.newWorkspace')}
              >
                <FiPlus className="w-4 h-4" />
              </button>
              {onDeleteWorkspace && activeWorkspace && workspaces.length > 1 && (
                <button
                  onClick={() => onDeleteWorkspace(activeWorkspace)}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors cursor-pointer"
                  title={t('sidebar.deleteWorkspace')}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <select
            value={activeWorkspace || ''}
            onChange={e => onWorkspaceSelect(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">{t('sidebar.selectWorkspace')}</option>
            {workspaces.map(workspace => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conteúdo do Workspace */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeWorkspaceData ? (
          <>
            {/* Botão para nova collection */}
            <button
              onClick={() => onNewCollection(activeWorkspaceData.id)}
              className="w-full px-3 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FiFolderPlus className="w-4 h-4" />
              {t('sidebar.newCollection')}
            </button>

            {/* Lista de Collections */}
            <div className="space-y-2">
              {activeWorkspaceData.collections.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                  <FiFolder className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm mb-2">{t('sidebar.noCollections')}</p>
                  <p className="text-xs">{t('sidebar.noCollectionsDescription')}</p>
                </div>
              ) : (
                activeWorkspaceData.collections.map(collection => (
                  <div
                    key={collection.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:shadow-md transition-shadow"
                  >
                    {/* Header da Collection */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <div className="flex items-center gap-2">
                        <FiChevronRight
                          className={`w-4 h-4 transition-transform duration-200 text-gray-600 dark:text-gray-300 ${
                            expandedCollections.includes(collection.id) ? 'rotate-90' : ''
                          }`}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{collection.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({collection.requests.length})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onNewRequest(collection.id)
                          }}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title={t('sidebar.addRequest')}
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onDeleteCollection(collection.id)
                          }}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title={t('sidebar.deleteCollection')}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lista de Requisições */}
                    {expandedCollections.includes(collection.id) && (
                      <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        {collection.requests.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            {t('sidebar.noRequestsInCollection')}
                          </div>
                        ) : (
                          collection.requests.map(request => (
                            <div
                              key={request.id}
                              className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 group transition-colors"
                              onClick={() => onRequestSelect(request)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(request.method)}`}
                                >
                                  {request.method}
                                </span>
                                <FiFile className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-900 dark:text-white truncate">{request.name}</span>
                              </div>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  onDeleteRequest(request.id)
                                }}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title={t('sidebar.deleteRequest')}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiFolder className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">{t('sidebar.selectWorkspaceToView')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
