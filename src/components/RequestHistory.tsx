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

// src/components/RequestHistory.tsx
import React, { useState, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { List, type ListImperativeAPI } from 'react-window'
import {
  FiClock,
  FiSearch,
  FiTrash2,
  FiDownload,
  FiPlay,
  FiX,
  FiBarChart,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import type { HistoryEntry } from '../types'

interface RequestHistoryProps {
  isOpen: boolean
  onClose: () => void
  history: HistoryEntry[]
  onRecreateRequest: (entry: HistoryEntry) => void
  onClearHistory: () => void
  onRemoveEntry: (entryId: string) => void
  onExportHistory: (format: 'json' | 'csv') => void
  searchHistory: (term: string) => HistoryEntry[]
  getStats: () => {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    methodStats: Record<string, number>
    statusCodeStats: Record<string, number>
    successRate: number
  }
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({
  isOpen,
  onClose,
  history,
  onRecreateRequest,
  onClearHistory,
  onRemoveEntry,
  onExportHistory,
  searchHistory,
  getStats,
}) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'success' | 'error' | 'ALL'>('ALL')
  const [showStats, setShowStats] = useState(false)

  // Aplicar filtros
  const filteredHistory = useMemo(() => {
    let filtered = history

    if (searchTerm.trim()) {
      filtered = searchHistory(searchTerm)
    }

    if (methodFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.method === methodFilter)
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(entry => entry.status === statusFilter)
    }

    return filtered
  }, [history, searchTerm, methodFilter, statusFilter, searchHistory])

  const stats = useMemo(() => getStats(), [getStats])

  const getMethodColor = useCallback((method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900'
      case 'POST':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900'
      case 'PUT':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900'
      case 'DELETE':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900'
      case 'PATCH':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900'
    }
  }, [])

  const getStatusColor = useCallback((status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 400) return 'text-red-600 dark:text-red-400'
    if (status >= 300) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }, [])

  const formatDuration = useCallback((ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }, [])

  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Agora há pouco'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    return date.toLocaleDateString()
  }, [])

  const uniqueMethods = Array.from(new Set(history.map(entry => entry.method)))

  // Ref para a lista virtual
  const listRef = useRef<ListImperativeAPI>(null)

  // Altura de cada item da lista
  const ITEM_HEIGHT = 88

  // Componente de linha para o virtual scrolling
  const Row = ({
    index,
    style,
  }: {
    ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' }
    index: number
    style: React.CSSProperties
  }) => {
    const entry = filteredHistory[index]

    return (
      <div style={style} className="border-b border-gray-200 dark:border-gray-700">
        <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Method Badge */}
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${getMethodColor(entry.method)}`}>
                {entry.method}
              </span>

              {/* URL */}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-gray-900 dark:text-white">{entry.url}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium ${getStatusColor(entry.response.status)}`}>
                    {entry.response.status} {entry.response.statusText}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDuration(entry.duration)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(entry.timestamp)}</span>
                </div>
              </div>

              {/* Status Icon */}
              <div className="flex items-center">
                {entry.status === 'success' ? (
                  <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <FiXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={() => onRecreateRequest(entry)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                title={t('history.recreateRequest')}
              >
                <FiPlay className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemoveEntry(entry.id)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-red-600 dark:text-red-400"
                title={t('history.removeEntry')}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('history.title')}</h2>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title={t('history.showStats')}
            >
              <FiBarChart className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalRequests}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('history.stats.totalRequests')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('history.stats.successRate')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatDuration(stats.averageResponseTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('history.stats.avgResponseTime')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(stats.methodStats).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('history.stats.methodsUsed')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">{t('history.filters.allMethods')}</option>
              {uniqueMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'success' | 'error' | 'ALL')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">{t('history.filters.allStatus')}</option>
              <option value="success">{t('history.filters.success')}</option>
              <option value="error">{t('history.filters.error')}</option>
            </select>

            {/* Action buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => onExportHistory('json')}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                title={t('history.exportJson')}
              >
                <FiDownload className="w-3 h-3" />
                JSON
              </button>
              <button
                onClick={() => onExportHistory('csv')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                title={t('history.exportCsv')}
              >
                <FiDownload className="w-3 h-3" />
                CSV
              </button>
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                title={t('history.clearAll')}
              >
                <FiTrash2 className="w-3 h-3" />
                {t('common.clear')}
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FiClock className="w-12 h-12 mb-4" />
              <p className="text-lg mb-2">{t('history.empty')}</p>
              <p className="text-sm">{t('history.emptyDescription')}</p>
            </div>
          ) : (
            <List
              listRef={listRef}
              rowCount={filteredHistory.length}
              rowHeight={ITEM_HEIGHT}
              rowComponent={Row}
              rowProps={{}}
              className="scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            />
          )}
        </div>
      </div>
    </div>
  )
}
