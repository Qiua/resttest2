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
import React, { useState } from 'react'
import { FiPlus, FiFolderPlus, FiFolder, FiFile, FiTrash2, FiChevronRight, FiMenu, FiX } from 'react-icons/fi'
import type { Workspace, SavedRequest } from '../types'

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  workspaces,
  activeWorkspace,
  onWorkspaceSelect,
  onRequestSelect,
  onNewWorkspace,
  onNewCollection,
  onNewRequest,
  onDeleteCollection,
  onDeleteRequest,
}) => {
  const [expandedCollections, setExpandedCollections] = useState<string[]>([])

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId]
    )
  }

  const activeWorkspaceData = workspaces.find((w) => w.id === activeWorkspace)

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
    return (
      <div className='w-12 bg-gray-800 dark:bg-gray-900 flex flex-col items-center py-4 transition-all duration-300 ease-in-out'>
        <button
          onClick={onToggle}
          className='text-white hover:bg-gray-700 dark:hover:bg-gray-800 p-2 rounded-md transition-colors duration-200'
          title='Abrir sidebar'
        >
          <FiMenu className='w-5 h-5' />
        </button>
      </div>
    )
  }

  return (
    <div className='w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out'>
      {/* Header do Sidebar */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>Collections</h2>
          <button
            onClick={onToggle}
            className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
            title='Fechar sidebar'
          >
            <FiX className='w-5 h-5' />
          </button>
        </div>

        {/* Seletor de Workspace */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Workspace</label>
            <button
              onClick={onNewWorkspace}
              className='p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors'
              title='Criar novo workspace'
            >
              <FiPlus className='w-4 h-4' />
            </button>
          </div>
          <select
            value={activeWorkspace || ''}
            onChange={(e) => onWorkspaceSelect(e.target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value=''>Selecionar workspace...</option>
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conteúdo do Workspace */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {activeWorkspaceData ? (
          <>
            {/* Botão para nova collection */}
            <button
              onClick={() => onNewCollection(activeWorkspaceData.id)}
              className='w-full px-3 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors'
            >
              <FiFolderPlus className='w-4 h-4' />
              Nova Coleção
            </button>

            {/* Lista de Collections */}
            <div className='space-y-2'>
              {activeWorkspaceData.collections.length === 0 ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg'>
                  <FiFolder className='w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600' />
                  <p className='text-sm mb-2'>Nenhuma collection encontrada</p>
                  <p className='text-xs'>Crie sua primeira collection para organizar suas requisições</p>
                </div>
              ) : (
                activeWorkspaceData.collections.map((collection) => (
                  <div
                    key={collection.id}
                    className='border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:shadow-md transition-shadow'
                  >
                    {/* Header da Collection */}
                    <div
                      className='flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <div className='flex items-center gap-2'>
                        <FiChevronRight
                          className={`w-4 h-4 transition-transform duration-200 text-gray-600 dark:text-gray-300 ${
                            expandedCollections.includes(collection.id) ? 'rotate-90' : ''
                          }`}
                        />
                        <span className='font-medium text-gray-900 dark:text-white'>{collection.name}</span>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>({collection.requests.length})</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onNewRequest(collection.id)
                          }}
                          className='p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors'
                          title='Adicionar requisição'
                        >
                          <FiPlus className='w-4 h-4' />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteCollection(collection.id)
                          }}
                          className='p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors'
                          title='Deletar collection'
                        >
                          <FiTrash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>

                    {/* Lista de Requisições */}
                    {expandedCollections.includes(collection.id) && (
                      <div className='border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'>
                        {collection.requests.length === 0 ? (
                          <div className='p-4 text-center text-gray-500 dark:text-gray-400 text-sm'>
                            Nenhuma requisição nesta collection
                          </div>
                        ) : (
                          collection.requests.map((request) => (
                            <div
                              key={request.id}
                              className='flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 group transition-colors'
                              onClick={() => onRequestSelect(request)}
                            >
                              <div className='flex items-center gap-3 flex-1 min-w-0'>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(request.method)}`}
                                >
                                  {request.method}
                                </span>
                                <FiFile className='w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
                                <span className='text-sm text-gray-900 dark:text-white truncate'>{request.name}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteRequest(request.id)
                                }}
                                className='p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all'
                                title='Deletar requisição'
                              >
                                <FiTrash2 className='w-4 h-4' />
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
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <FiFolder className='w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600' />
            <p className='text-sm'>Selecione um workspace para ver as collections</p>
          </div>
        )}
      </div>
    </div>
  )
}
