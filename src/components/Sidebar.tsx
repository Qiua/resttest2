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
import type { Workspace, SavedRequest } from '../types'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  workspaces: Workspace[]
  activeWorkspace?: string
  onWorkspaceSelect: (workspaceId: string) => void
  onRequestSelect: (request: SavedRequest) => void
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
        return 'text-green-600 bg-green-50'
      case 'POST':
        return 'text-blue-600 bg-blue-50'
      case 'PUT':
        return 'text-yellow-600 bg-yellow-50'
      case 'DELETE':
        return 'text-red-600 bg-red-50'
      case 'PATCH':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) {
    return (
      <div className='w-12 bg-gray-800 flex flex-col items-center py-4 transition-all duration-300 ease-in-out'>
        <button
          onClick={onToggle}
          className='text-white hover:bg-gray-700 p-2 rounded-md transition-colors duration-200'
          title='Abrir sidebar'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className='w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out'>
      {/* Header do Sidebar */}
      <div className='p-4 border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between mb-3'>
          <h2 className='text-lg font-semibold text-gray-900'>Collections</h2>
          <button
            onClick={onToggle}
            className='text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded'
            title='Fechar sidebar'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Seletor de Workspace */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Workspace</label>
          <select
            value={activeWorkspace || ''}
            onChange={(e) => onWorkspaceSelect(e.target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
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
              className='w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Nova Collection
            </button>

            {/* Lista de Collections */}
            <div className='space-y-2'>
              {activeWorkspaceData.collections.length === 0 ? (
                <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
                  <svg
                    className='w-8 h-8 mx-auto mb-2 text-gray-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                    />
                  </svg>
                  <p className='text-sm mb-2'>Nenhuma collection encontrada</p>
                  <p className='text-xs'>Crie sua primeira collection para organizar suas requisições</p>
                </div>
              ) : (
                activeWorkspaceData.collections.map((collection) => (
                  <div
                    key={collection.id}
                    className='border border-gray-200 rounded-lg bg-white hover:shadow-md'
                  >
                    {/* Header da Collection */}
                    <div
                      className='flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50'
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <div className='flex items-center gap-2'>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedCollections.includes(collection.id) ? 'rotate-90' : ''
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                        <span className='font-medium text-gray-900'>{collection.name}</span>
                        <span className='text-xs text-gray-500'>({collection.requests.length})</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onNewRequest(collection.id)
                          }}
                          className='p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded'
                          title='Adicionar requisição'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteCollection(collection.id)
                          }}
                          className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded'
                          title='Deletar collection'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Lista de Requisições */}
                    {expandedCollections.includes(collection.id) && (
                      <div className='border-t border-gray-200 bg-gray-50'>
                        {collection.requests.length === 0 ? (
                          <div className='p-4 text-center text-gray-500 text-sm'>
                            Nenhuma requisição nesta collection
                          </div>
                        ) : (
                          collection.requests.map((request) => (
                            <div
                              key={request.id}
                              className='flex items-center justify-between p-3 hover:bg-white cursor-pointer border-b border-gray-200 last:border-b-0 group'
                              onClick={() => onRequestSelect(request)}
                            >
                              <div className='flex items-center gap-3 flex-1 min-w-0'>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(
                                    request.method
                                  )}`}
                                >
                                  {request.method}
                                </span>
                                <span className='text-sm text-gray-900 truncate'>{request.name}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteRequest(request.id)
                                }}
                                className='p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                                title='Deletar requisição'
                              >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                  />
                                </svg>
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
          <div className='text-center py-8 text-gray-500'>
            <svg className='w-12 h-12 mx-auto mb-4 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
            <p className='text-sm'>Selecione um workspace para ver as collections</p>
          </div>
        )}
      </div>
    </div>
  )
}
