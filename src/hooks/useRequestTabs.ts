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

// src/hooks/useRequestTabs.ts
import { useState, useCallback } from 'react'
import type { RequestTab, SavedRequest, ApiResponse } from '../types'

export const useRequestTabs = () => {
  const [tabs, setTabs] = useState<RequestTab[]>([
    {
      id: crypto.randomUUID(),
      name: 'Nova Requisição',
      method: 'GET',
      url: 'https://httpbin.org/get',
      auth: { type: 'none' },
      headers: [],
      params: [],
      body: { type: 'form-data', content: '' },
      isModified: false,
    },
  ])

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '')

  // Função para criar uma nova aba
  const createNewTab = useCallback((savedRequest?: SavedRequest) => {
    const newTab: RequestTab = {
      id: crypto.randomUUID(),
      name: savedRequest?.name || 'Nova Requisição',
      method: savedRequest?.method || 'GET',
      url: savedRequest?.url || 'https://httpbin.org/get',
      auth: savedRequest?.auth || { type: 'none' },
      headers: savedRequest?.headers || [],
      params: savedRequest?.params || [],
      body: savedRequest?.body || { type: 'form-data', content: '' },
      isModified: false,
      savedRequestId: savedRequest?.id,
    }

    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    return newTab.id
  }, [])

  // Função para fechar uma aba
  const closeTab = useCallback(
    (tabId: string) => {
      setTabs(prev => {
        const newTabs = prev.filter(tab => tab.id !== tabId)

        // Se não sobrar nenhuma aba, criar uma nova
        if (newTabs.length === 0) {
          const defaultTab: RequestTab = {
            id: crypto.randomUUID(),
            name: 'Nova Requisição',
            method: 'GET',
            url: 'https://httpbin.org/get',
            auth: { type: 'none' },
            headers: [],
            params: [],
            body: { type: 'form-data', content: '' },
            isModified: false,
          }
          return [defaultTab]
        }

        return newTabs
      })

      // Se a aba ativa foi fechada, selecionar outra
      if (activeTabId === tabId) {
        setTabs(prev => {
          const newTabs = prev.filter(tab => tab.id !== tabId)
          if (newTabs.length > 0) {
            const currentIndex = prev.findIndex(tab => tab.id === tabId)
            const newActiveIndex = Math.min(currentIndex, newTabs.length - 1)
            setActiveTabId(newTabs[newActiveIndex].id)
          } else {
            // Se não sobrar nenhuma aba, será criada uma nova acima
            setTimeout(() => {
              setTabs(currentTabs => {
                if (currentTabs.length > 0) {
                  setActiveTabId(currentTabs[0].id)
                }
                return currentTabs
              })
            })
          }
          return prev
        })
      }
    },
    [activeTabId],
  )

  // Função para selecionar uma aba
  const selectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  // Função para atualizar uma aba
  const updateTab = useCallback((tabId: string, updates: Partial<RequestTab>) => {
    setTabs(prev => prev.map(tab => (tab.id === tabId ? { ...tab, ...updates, isModified: true } : tab)))
  }, [])

  // Função para marcar uma aba como salva (não modificada)
  const markTabAsSaved = useCallback((tabId: string, savedRequestId?: string) => {
    setTabs(prev => prev.map(tab => (tab.id === tabId ? { ...tab, isModified: false, savedRequestId } : tab)))
  }, [])

  // Função para definir a resposta de uma aba
  const setTabResponse = useCallback(
    (tabId: string, response: ApiResponse | null, loading = false, error: string | null = null) => {
      setTabs(prev => prev.map(tab => (tab.id === tabId ? { ...tab, response, loading, error } : tab)))
    },
    [],
  )

  // Função para obter a aba ativa
  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId) || null
  }, [tabs, activeTabId])

  // Função para duplicar uma aba
  const duplicateTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId)
      if (!tab) return

      const newTab: RequestTab = {
        ...tab,
        id: crypto.randomUUID(),
        name: `${tab.name} (Cópia)`,
        isModified: false,
        savedRequestId: undefined, // Remove a associação com a requisição salva
        response: null,
        loading: false,
        error: null,
      }

      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
      return newTab.id
    },
    [tabs],
  )

  return {
    tabs,
    activeTabId,
    createNewTab,
    closeTab,
    selectTab,
    updateTab,
    markTabAsSaved,
    setTabResponse,
    getActiveTab,
    duplicateTab,
  }
}
