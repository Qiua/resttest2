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

// src/hooks/useRequestHistory.ts
import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { HistoryEntry, HistoryConfig, RequestTab, ApiResponse } from '../types'

const DEFAULT_HISTORY_CONFIG: HistoryConfig = {
  maxEntries: 1000,
  autoSave: true,
  includeRequestBody: true,
  includeResponseBody: true,
}

export const useRequestHistory = () => {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('requestHistory', [])
  const [historyConfig, setHistoryConfig] = useLocalStorage<HistoryConfig>('historyConfig', DEFAULT_HISTORY_CONFIG)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Adicionar entrada ao histórico
  const addToHistory = useCallback(
    (tab: RequestTab, response: ApiResponse, duration: number, status: 'success' | 'error', error?: string) => {
      if (!historyConfig.autoSave) return

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        method: tab.method,
        url: tab.url,
        auth: tab.auth,
        headers: historyConfig.includeRequestBody ? tab.headers : [],
        params: historyConfig.includeRequestBody ? tab.params : [],
        body: historyConfig.includeRequestBody ? tab.body : { type: 'form-data', content: '' },
        response: historyConfig.includeResponseBody
          ? response
          : {
              ...response,
              body: '[Response body not saved]',
              headers: '[Response headers not saved]',
            },
        duration,
        status,
        error,
      }

      setHistory((prev) => {
        const newHistory = [entry, ...prev]
        // Limitar o número de entradas conforme configuração
        return newHistory.slice(0, historyConfig.maxEntries)
      })
    },
    [historyConfig, setHistory]
  )

  // Buscar entradas no histórico
  const searchHistory = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return history

      const term = searchTerm.toLowerCase()
      return history.filter(
        (entry) =>
          entry.url.toLowerCase().includes(term) ||
          entry.method.toLowerCase().includes(term) ||
          entry.response.status.toString().includes(term)
      )
    },
    [history]
  )

  // Filtrar histórico por método
  const filterByMethod = useCallback(
    (method: string) => {
      if (method === 'ALL') return history
      return history.filter((entry) => entry.method === method)
    },
    [history]
  )

  // Filtrar histórico por status
  const filterByStatus = useCallback(
    (status: 'success' | 'error' | 'ALL') => {
      if (status === 'ALL') return history
      return history.filter((entry) => entry.status === status)
    },
    [history]
  )

  // Filtrar histórico por período
  const filterByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return history.filter((entry) => {
        const entryDate = new Date(entry.timestamp)
        return entryDate >= startDate && entryDate <= endDate
      })
    },
    [history]
  )

  // Obter estatísticas do histórico
  const getStats = useCallback(() => {
    const totalRequests = history.length
    const successfulRequests = history.filter((entry) => entry.status === 'success').length
    const failedRequests = history.filter((entry) => entry.status === 'error').length
    const averageResponseTime =
      history.length > 0 ? history.reduce((acc, entry) => acc + entry.duration, 0) / history.length : 0

    const methodStats = history.reduce((acc, entry) => {
      acc[entry.method] = (acc[entry.method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusCodeStats = history.reduce((acc, entry) => {
      const statusCode = entry.response.status.toString()
      acc[statusCode] = (acc[statusCode] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      methodStats,
      statusCodeStats,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
    }
  }, [history])

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  // Remover entrada específica
  const removeEntry = useCallback(
    (entryId: string) => {
      setHistory((prev) => prev.filter((entry) => entry.id !== entryId))
    },
    [setHistory]
  )

  // Exportar histórico
  const exportHistory = useCallback(
    (format: 'json' | 'csv' = 'json') => {
      if (format === 'json') {
        const dataStr = JSON.stringify(history, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `request-history-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        const csvHeaders = 'Timestamp,Method,URL,Status Code,Response Time (ms),Status\n'
        const csvData = history
          .map(
            (entry) =>
              `${entry.timestamp},${entry.method},${entry.url},${entry.response.status},${entry.duration},${entry.status}`
          )
          .join('\n')

        const csvContent = csvHeaders + csvData
        const dataBlob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `request-history-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }
    },
    [history]
  )

  // Reexecutar uma entrada do histórico
  const recreateTabFromHistory = useCallback((entry: HistoryEntry) => {
    return {
      id: crypto.randomUUID(),
      name: `${entry.method} ${entry.url}`,
      method: entry.method,
      url: entry.url,
      auth: entry.auth,
      headers: entry.headers,
      params: entry.params,
      body: entry.body,
      isModified: false,
    }
  }, [])

  return {
    history,
    historyConfig,
    isHistoryOpen,
    setIsHistoryOpen,
    setHistoryConfig,
    addToHistory,
    searchHistory,
    filterByMethod,
    filterByStatus,
    filterByDateRange,
    getStats,
    clearHistory,
    removeEntry,
    exportHistory,
    recreateTabFromHistory,
  }
}
