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

// src/App.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiRefreshCw, FiSettings, FiClock } from 'react-icons/fi'
import axios, { AxiosError } from 'axios'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { RequestForm } from './features/RequestForm'
import { ResponseDisplay } from './features/ResponseDisplay'
import { Sidebar } from './components/Sidebar'
import { RequestTabs } from './components/RequestTabs'
import { ThemeToggle } from './components/ThemeToggle'
import { LanguageSelector } from './components/LanguageSelector'
import { EnvironmentSelector } from './components/EnvironmentSelector'
import { EnvironmentManager } from './components/EnvironmentManager'
import { ImportExportModal } from './components/ImportExportModal'
import { ProxySettings } from './components/ProxySettings'
import { ConfirmModal } from './components/ConfirmModal'
import { PromptModal } from './components/PromptModal'
import { NotificationModal } from './components/NotificationModal'
import { RequestHistory } from './components/RequestHistory'
import { type SavedRequest, type Workspace, type Collection, type HistoryEntry } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useRequestTabs } from './hooks/useRequestTabs'
import { useRequestHistory } from './hooks/useRequestHistory'
import { useEnvironments } from './hooks/useEnvironments'
import { useModal } from './hooks/useModal'
import { type ProxyConfig, applyProxy, configureAxiosForProxy } from './utils/corsProxy'

function App() {
  const { t } = useTranslation()

  // Sistema de tabs para gerenciar múltiplas requisições
  const {
    tabs,
    activeTabId,
    createNewTab,
    closeTab,
    selectTab,
    updateTab,
    markTabAsSaved,
    setTabResponse,
    getActiveTab,
  } = useRequestTabs()

  // Sistema de histórico de requisições
  const {
    history,
    addToHistory,
    isHistoryOpen,
    setIsHistoryOpen,
    recreateTabFromHistory,
    clearHistory,
    removeEntry,
    exportHistory,
    searchHistory,
    getStats,
  } = useRequestHistory()

  // Estados das Requisições Salvas (mantido para compatibilidade)
  const [savedRequests, setSavedRequests] = useLocalStorage<SavedRequest[]>('savedRequests', [])

  // Estado dos Workspaces e Collections
  const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>('workspaces', [
    {
      id: 'default',
      name: 'Meu Workspace',
      description: 'Workspace padrão',
      collections: [
        {
          id: 'default-collection',
          name: 'Primeira Collection',
          description: 'Collection de exemplo',
          requests: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])

  // Estado da Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeWorkspace, setActiveWorkspace] = useState<string>('default')

  // Hook para modais
  const modal = useModal()

  // Sistema de ambientes (environments)
  const {
    environments,
    activeEnvironmentId,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
    duplicateEnvironment,
    addVariable,
    updateVariable,
    deleteVariable,
    resolveVariables,
    importEnvironment,
    exportEnvironment,
    exportAllEnvironments,
  } = useEnvironments()

  // Estado do Modal de Ambientes
  const [environmentManagerOpen, setEnvironmentManagerOpen] = useState(false)

  // Estado do Modal de Importação/Exportação
  const [importExportModalOpen, setImportExportModalOpen] = useState(false)

  // Estado das Configurações de Proxy
  const [proxySettingsOpen, setProxySettingsOpen] = useState(false)
  const [proxyConfig, setProxyConfig] = useLocalStorage<ProxyConfig>('proxyConfig', {
    type: 'none',
    enabled: false,
  })

  // Funções para manipular workspaces e collections
  const handleNewWorkspace = async () => {
    const name = await modal.showPrompt({
      title: t('sidebar.newWorkspace'),
      message: `${t('sidebar.newWorkspace')}:`,
      placeholder: t('sidebar.workspaceName'),
    })
    if (!name) return

    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name,
      description: '',
      collections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces(prev => [...prev, newWorkspace])
    setActiveWorkspace(newWorkspace.id)
  }

  const handleNewCollection = async (workspaceId: string) => {
    const name = await modal.showPrompt({
      title: t('sidebar.newCollection'),
      message: `${t('sidebar.newCollection')}:`,
      placeholder: t('sidebar.collectionName'),
    })
    if (!name) return

    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      description: '',
      requests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              collections: [...workspace.collections, newCollection],
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )
  }

  const handleNewRequest = async (collectionId?: string) => {
    const name = await modal.showPrompt({
      title: t('sidebar.addRequest'),
      message: `${t('sidebar.addRequest')}:`,
      placeholder: t('sidebar.requestName'),
    })
    if (!name) return

    // Se não foi especificada uma collection, usa a primeira disponível
    const targetWorkspace = workspaces.find(w => w.id === activeWorkspace)
    if (!targetWorkspace || targetWorkspace.collections.length === 0) {
      modal.showNotification({
        title: t('common.error'),
        message: t('messages.createCollectionFirst'),
        type: 'error',
      })
      return
    }

    const targetCollectionId = collectionId || targetWorkspace.collections[0].id

    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name,
      method: 'GET',
      url: 'https://httpbin.org/get',
      auth: { type: 'none' },
      headers: [],
      params: [],
      body: { type: 'form-data', content: '' },
      collectionId: targetCollectionId,
    }

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map(collection =>
                collection.id === targetCollectionId
                  ? {
                      ...collection,
                      requests: [...collection.requests, newRequest],
                      updatedAt: new Date().toISOString(),
                    }
                  : collection,
              ),
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )
  }

  const handleRequestSelect = (request: SavedRequest) => {
    // Abrir a requisição em uma nova aba
    createNewTab(request)
  }

  // Função para lidar com requisições do histórico
  const handleRequestFromHistory = (historyEntry: HistoryEntry) => {
    const newTab = recreateTabFromHistory(historyEntry)
    createNewTab(newTab)
  }

  const handleDeleteCollection = async (collectionId: string) => {
    const confirmed = await modal.showConfirm({
      title: t('messages.confirmDeleteCollection'),
      message: t('messages.confirmDeleteCollectionMessage'),
      type: 'danger',
      confirmText: t('common.delete'),
    })

    if (!confirmed) return

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.filter(c => c.id !== collectionId),
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )
  }

  const handleDeleteRequestFromSidebar = async (requestId: string) => {
    const confirmed = await modal.showConfirm({
      title: t('messages.confirmDeleteRequest'),
      message: t('messages.confirmDeleteRequestMessage'),
      type: 'danger',
      confirmText: t('common.delete'),
    })

    if (!confirmed) return

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map(collection => ({
                ...collection,
                requests: collection.requests.filter(r => r.id !== requestId),
                updatedAt: new Date().toISOString(),
              })),
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )
  }

  // Função para salvar requisição no sistema de collections
  const handleSaveCurrentRequest = async () => {
    const activeTab = getActiveTab()
    if (!activeTab) return

    const name = await modal.showPrompt({
      title: t('messages.requestName'),
      message: `${t('messages.requestName')}:`,
      placeholder: t('sidebar.requestName'),
    })
    if (!name) return

    const targetWorkspace = workspaces.find(w => w.id === activeWorkspace)
    if (!targetWorkspace || targetWorkspace.collections.length === 0) {
      modal.showNotification({
        title: t('common.error'),
        message: t('messages.createCollectionFirst'),
        type: 'error',
      })
      return
    }

    const targetCollectionId = targetWorkspace.collections[0].id // Usa a primeira collection

    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name,
      method: activeTab.method,
      url: activeTab.url,
      auth: activeTab.auth,
      headers: activeTab.headers,
      params: activeTab.params,
      body: activeTab.body,
      collectionId: targetCollectionId,
    }

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map(collection =>
                collection.id === targetCollectionId
                  ? {
                      ...collection,
                      requests: [...collection.requests, newRequest],
                      updatedAt: new Date().toISOString(),
                    }
                  : collection,
              ),
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )

    // Marcar a aba como salva
    markTabAsSaved(activeTab.id, newRequest.id)

    modal.showNotification({
      title: t('common.success'),
      message: t('messages.requestSaved', { name }),
      type: 'success',
    })
  }

  // Função para enviar a requisição
  const handleSubmit = async () => {
    const activeTab = getActiveTab()
    if (!activeTab) return

    // Iniciar medição de tempo para o histórico
    const startTime = performance.now()

    // Resolver variáveis de ambiente na URL e outros campos
    const resolvedUrl = resolveVariables(activeTab.url)
    const resolvedHeaders = activeTab.headers.map(h => ({
      ...h,
      key: resolveVariables(h.key),
      value: resolveVariables(h.value),
    }))
    const resolvedAuth = {
      ...activeTab.auth,
      token: activeTab.auth.token ? resolveVariables(activeTab.auth.token) : '',
      username: activeTab.auth.username ? resolveVariables(activeTab.auth.username) : '',
      password: activeTab.auth.password ? resolveVariables(activeTab.auth.password) : '',
      apiKeyValue: activeTab.auth.apiKeyValue ? resolveVariables(activeTab.auth.apiKeyValue) : '',
    }

    // Definir estado de loading na aba
    setTabResponse(activeTab.id, null, true, null)

    const tempHeaders = new Headers()
    let data: string | FormData | URLSearchParams | undefined

    // Define o corpo da requisição com base no tipo selecionado
    if (activeTab.body.type === 'json' || activeTab.body.type === 'xml' || activeTab.body.type === 'text') {
      data = resolveVariables(activeTab.body.content)
      // Define o Content-Type, a menos que o usuário já tenha definido um manualmente
      const contentTypeMap = {
        json: 'application/json',
        xml: 'application/xml',
        text: 'text/plain',
      }
      if (!activeTab.headers.some(h => h.key.toLowerCase() === 'content-type')) {
        tempHeaders.set('Content-Type', contentTypeMap[activeTab.body.type])
      }
    } else if (activeTab.body.type === 'form-data') {
      const hasFiles = activeTab.params.some(p => 'file' in p && p.file)
      if (hasFiles) {
        // Multipart/form-data
        const formData = new FormData()
        activeTab.params.forEach(p => {
          if ('file' in p && p.file) formData.append(p.key || `file_${p.id}`, p.file)
          else if ('value' in p) formData.append(resolveVariables(p.key), resolveVariables(p.value))
        })
        data = formData
        // O navegador define o Content-Type para multipart automaticamente
      } else {
        // application/x-www-form-urlencoded
        const searchParams = new URLSearchParams()
        activeTab.params.forEach(p => {
          if ('value' in p) searchParams.append(resolveVariables(p.key), resolveVariables(p.value))
        })
        data = searchParams
        tempHeaders.set('Content-Type', 'application/x-www-form-urlencoded')
      }
    }
    // Constrói os headers finais, combinando os manuais e os automáticos
    const finalHeaders: Record<string, string> = {}
    tempHeaders.forEach((value, key) => {
      finalHeaders[key] = value
    })
    resolvedHeaders.forEach(h => {
      if (h.key) finalHeaders[h.key] = h.value
    })

    // Lógica de autorização com variáveis resolvidas
    if (resolvedAuth.type === 'bearer' && resolvedAuth.token) {
      finalHeaders['Authorization'] = `Bearer ${resolvedAuth.token}`
    }
    if (resolvedAuth.type === 'api-key' && resolvedAuth.apiKeyHeader && resolvedAuth.apiKeyValue) {
      finalHeaders[resolvedAuth.apiKeyHeader] = resolvedAuth.apiKeyValue
    }

    // Only apply data to non-GET/HEAD requests if it hasn't been set already
    if (activeTab.method !== 'GET' && activeTab.method !== 'HEAD' && !data) {
      const hasFiles = activeTab.params.some(p => 'file' in p && p.file)
      if (hasFiles) {
        const formData = new FormData()
        activeTab.params.forEach(p => {
          if ('file' in p && p.file) {
            formData.append(resolveVariables(p.key) || `file_${p.id}`, p.file)
          } else if ('value' in p) {
            formData.append(resolveVariables(p.key), resolveVariables(p.value))
          }
        })
        data = formData
      } else {
        const searchParams = new URLSearchParams()
        activeTab.params.forEach(p => {
          if ('value' in p) {
            searchParams.append(resolveVariables(p.key), resolveVariables(p.value))
          }
        })
        data = searchParams
      }
    }

    try {
      // Aplicar proxy se configurado (usando URL resolvida)
      const finalUrl = applyProxy(resolvedUrl, proxyConfig)

      // Configurar axios para o proxy (usando headers resolvidos)
      const axiosConfig = configureAxiosForProxy(
        {
          method: activeTab.method,
          url: finalUrl,
          headers: finalHeaders,
          data,
          auth:
            resolvedAuth.type === 'basic'
              ? {
                  username: resolvedAuth.username || '',
                  password: resolvedAuth.password || '',
                }
              : undefined,
        },
        proxyConfig,
      )

      const result = await axios(axiosConfig)
      const contentType = result.headers['content-type'] || ''
      let responseBody = result.data

      // Se a resposta for JSON, formata com indentação.
      // Se não, usa o texto como está (útil para HTML ou texto puro).
      if (contentType.includes('application/json') && typeof responseBody === 'object') {
        responseBody = JSON.stringify(responseBody, null, 2)
      } else if (typeof responseBody !== 'string') {
        // Fallback para outros tipos de objeto
        responseBody = String(responseBody)
      }

      setTabResponse(
        activeTab.id,
        {
          status: result.status,
          statusText: result.statusText,
          headers: JSON.stringify(result.headers, null, 2),
          body: responseBody,
          contentType,
        },
        false,
        null,
      )

      // Adicionar ao histórico
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      addToHistory(
        activeTab,
        {
          status: result.status,
          statusText: result.statusText,
          headers: JSON.stringify(result.headers, null, 2),
          body: responseBody,
          contentType,
        },
        duration,
        'success',
      )
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const contentType = err.response.headers['content-type'] || ''
        let errorBody = err.response.data

        if (contentType.includes('application/json') && typeof errorBody === 'object') {
          errorBody = JSON.stringify(errorBody, null, 2)
        } else if (typeof errorBody !== 'string') {
          errorBody = String(errorBody)
        }

        setTabResponse(
          activeTab.id,
          {
            status: err.response.status,
            statusText: err.response.statusText,
            headers: JSON.stringify(err.response.headers, null, 2),
            body: errorBody,
            contentType,
          },
          false,
          null,
        )

        // Adicionar ao histórico
        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)
        addToHistory(
          activeTab,
          {
            status: err.response.status,
            statusText: err.response.statusText,
            headers: JSON.stringify(err.response.headers, null, 2),
            body: errorBody,
            contentType,
          },
          duration,
          'error',
        )
      } else {
        setTabResponse(activeTab.id, null, false, t('common.unexpectedError'))

        // Adicionar ao histórico mesmo em caso de erro genérico
        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)
        addToHistory(
          activeTab,
          {
            status: 0,
            statusText: 'Network Error',
            headers: '{}',
            body: t('common.unexpectedError'),
            contentType: 'text/plain',
          },
          duration,
          'error',
          t('common.unexpectedError'),
        )
      }
    }
  }

  // Função para migrar requests antigos para o sistema de collections
  const migrateOldRequests = () => {
    const requestsToMigrate = savedRequests.filter(req => !req.collectionId)

    if (requestsToMigrate.length === 0) return

    const targetWorkspace = workspaces.find(w => w.id === activeWorkspace)
    if (!targetWorkspace || targetWorkspace.collections.length === 0) return

    const targetCollectionId = targetWorkspace.collections[0].id

    const migratedRequests = requestsToMigrate.map(req => ({
      ...req,
      collectionId: targetCollectionId,
      // Garantir que todos os campos obrigatórios estão presentes com valores padrão
      method: req.method || 'GET',
      url: req.url || '',
      auth: req.auth || { type: 'none' },
      headers: req.headers || [],
      params: req.params || [],
      body: req.body || { type: 'form-data', content: '' },
    }))

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map(collection =>
                collection.id === targetCollectionId
                  ? {
                      ...collection,
                      requests: [...collection.requests, ...migratedRequests],
                      updatedAt: new Date().toISOString(),
                    }
                  : collection,
              ),
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )

    // Remove os requests antigos ou marca como migrados
    setSavedRequests(prev =>
      prev.map(req =>
        requestsToMigrate.find(migrated => migrated.id === req.id) ? { ...req, collectionId: targetCollectionId } : req,
      ),
    )
  }

  // Handlers para Importação/Exportação
  const handleImportExportModal = () => {
    setImportExportModalOpen(true)
  }

  const handleWorkspaceImported = (workspace: Workspace) => {
    // Gerar um novo ID para evitar conflitos
    const newWorkspace = {
      ...workspace,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces(prev => [...prev, newWorkspace])
    setActiveWorkspace(newWorkspace.id)
  }

  const handleCollectionImported = (collection: Collection, workspaceId: string) => {
    // Gerar um novo ID para a collection para evitar conflitos
    const newCollection = {
      ...collection,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces(prev =>
      prev.map(workspace =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              collections: [...workspace.collections, newCollection],
              updatedAt: new Date().toISOString(),
            }
          : workspace,
      ),
    )
  }

  // Handlers para o sistema de ambientes
  const handleExportAllEnvironments = () => {
    const allEnvironments = exportAllEnvironments()
    if (allEnvironments.length === 0) return

    const dataStr = JSON.stringify(allEnvironments, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'all_environments.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleWorkspaceSelect = (workspaceId: string) => {
    setActiveWorkspace(workspaceId)
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId)
    if (!workspace) return

    const confirmed = await modal.showConfirm({
      title: t('messages.confirmDeleteWorkspace'),
      message: t('messages.confirmDeleteWorkspaceMessage', {
        name: workspace.name,
      }),
      type: 'danger',
      confirmText: t('common.delete'),
    })

    if (!confirmed) return

    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId))

    // Se o workspace ativo foi deletado, selecionar outro
    if (activeWorkspace === workspaceId) {
      const remaining = workspaces.filter(w => w.id !== workspaceId)
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0].id)
      } else {
        // Criar um novo workspace padrão se não sobrar nenhum
        const newWorkspace: Workspace = {
          id: 'default',
          name: 'Meu Workspace',
          description: 'Workspace padrão',
          collections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setWorkspaces([newWorkspace])
        setActiveWorkspace('default')
      }
    }
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      {/* Sidebar com melhor integração visual */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceSelect={handleWorkspaceSelect}
        onRequestSelect={handleRequestSelect}
        onNewWorkspace={handleNewWorkspace}
        onNewCollection={handleNewCollection}
        onNewRequest={handleNewRequest}
        onDeleteCollection={handleDeleteCollection}
        onDeleteRequest={handleDeleteRequestFromSidebar}
        onDeleteWorkspace={handleDeleteWorkspace}
        onImportExport={handleImportExportModal}
      />

      {/* Área Principal com responsividade */}
      <div className="flex-1 flex flex-col min-w-0 backdrop-blur-sm">
        {/* Header aprimorado com melhor UX */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-lg backdrop-blur-sm dark:bg-gray-800/95 dark:border-gray-700 transition-all duration-200 relative z-50">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">REST Test</h1>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
              v2.0
            </span>
          </div>

          {/* Controles do Header com melhor UX */}
          <div className="flex items-center gap-3">
            {savedRequests.some(req => !req.collectionId) && (
              <button
                onClick={migrateOldRequests}
                className="px-3 py-2 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/30 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                title="Migrar requests antigos para collections"
                aria-label="Migrar requests antigos para collections"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Migrar ({savedRequests.filter(req => !req.collectionId).length})</span>
              </button>
            )}

            <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1 gap-2 border border-gray-200 dark:border-gray-600">
              {/* Environment Selector */}
              <EnvironmentSelector
                environments={environments}
                activeEnvironmentId={activeEnvironmentId}
                onEnvironmentSelect={setActiveEnvironment}
                onManageEnvironments={() => setEnvironmentManagerOpen(true)}
              />

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group"
                title={t('history.title')}
                aria-label={t('history.title')}
              >
                <FiClock size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>

              <button
                onClick={() => setProxySettingsOpen(true)}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group"
                title={t('proxy.settings')}
                aria-label={t('proxy.settings')}
              >
                <FiSettings size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

              <div className="flex items-center gap-1">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Request Tabs */}
        <RequestTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={selectTab}
          onTabClose={closeTab}
          onNewTab={() => createNewTab()}
        />

        {/* Conteúdo Principal com melhor espaçamento */}
        <main className="flex-1 min-h-0 p-4">
          <PanelGroup
            direction="vertical"
            className="bg-white rounded-xl shadow-lg border border-gray-200 h-full dark:bg-gray-800 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
          >
            <Panel defaultSize={50} minSize={20} className="overflow-hidden">
              {getActiveTab() && (
                <RequestForm
                  method={getActiveTab()!.method}
                  setMethod={method => updateTab(activeTabId!, { method })}
                  url={getActiveTab()!.url}
                  setUrl={url => updateTab(activeTabId!, { url })}
                  auth={getActiveTab()!.auth}
                  setAuth={auth => updateTab(activeTabId!, { auth })}
                  headers={getActiveTab()!.headers}
                  setHeaders={headers => updateTab(activeTabId!, { headers })}
                  params={getActiveTab()!.params}
                  setParams={params => updateTab(activeTabId!, { params })}
                  body={getActiveTab()!.body}
                  setBody={body => updateTab(activeTabId!, { body })}
                  onSubmit={handleSubmit}
                  onSave={handleSaveCurrentRequest}
                  loading={getActiveTab()!.loading || false}
                  proxyConfig={proxyConfig}
                  onProxySettings={() => setProxySettingsOpen(true)}
                />
              )}
            </Panel>
            <PanelResizeHandle
              className='h-px bg-gray-200 hover:bg-blue-500 dark:bg-gray-600 dark:hover:bg-blue-400 data-[resize-handle-state=drag]:bg-blue-500 dark:data-[resize-handle-state=drag]:bg-blue-400 transition-all duration-300 cursor-ns-resize relative group
              before:content-[""] before:absolute before:inset-x-0 before:-inset-y-2 before:bg-transparent hover:before:bg-blue-50/50 dark:hover:before:bg-blue-900/20 before:transition-all before:duration-300
              after:content-[""] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-12 after:h-1 after:bg-blue-500/0 hover:after:bg-blue-500/70 dark:hover:after:bg-blue-400/70 after:rounded-full after:transition-all after:duration-300 after:shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
            />
            <Panel defaultSize={50} minSize={20} className="overflow-hidden">
              <div className="h-full p-6 bg-gray-50/50 dark:bg-gray-800/50">
                {getActiveTab() && (
                  <ResponseDisplay
                    response={getActiveTab()!.response || null}
                    loading={getActiveTab()!.loading || false}
                    error={getActiveTab()!.error || null}
                  />
                )}
              </div>
            </Panel>
          </PanelGroup>
        </main>
      </div>

      {/* Modal de Gerenciamento de Ambientes */}
      <EnvironmentManager
        isOpen={environmentManagerOpen}
        onClose={() => setEnvironmentManagerOpen(false)}
        environments={environments}
        activeEnvironmentId={activeEnvironmentId}
        onCreateEnvironment={createEnvironment}
        onUpdateEnvironment={updateEnvironment}
        onDeleteEnvironment={deleteEnvironment}
        onDuplicateEnvironment={duplicateEnvironment}
        onSetActiveEnvironment={setActiveEnvironment}
        onAddVariable={addVariable}
        onUpdateVariable={updateVariable}
        onDeleteVariable={deleteVariable}
        onImportEnvironment={importEnvironment}
        onExportEnvironment={exportEnvironment}
        onExportAllEnvironments={handleExportAllEnvironments}
      />

      {/* Modal de Importação/Exportação */}
      <ImportExportModal
        isOpen={importExportModalOpen}
        onClose={() => setImportExportModalOpen(false)}
        workspaces={workspaces}
        onWorkspaceImported={handleWorkspaceImported}
        onCollectionImported={handleCollectionImported}
      />

      {/* Modal de Configurações de Proxy */}
      <ProxySettings
        isOpen={proxySettingsOpen}
        onClose={() => setProxySettingsOpen(false)}
        proxyConfig={proxyConfig}
        onConfigChange={setProxyConfig}
        currentUrl={getActiveTab()?.url || ''}
      />

      {/* Modais do Sistema */}
      <ConfirmModal
        isOpen={modal.confirmModal.isOpen}
        onClose={modal.closeConfirm}
        onConfirm={modal.confirmModal.onConfirm}
        title={modal.confirmModal.options.title}
        message={modal.confirmModal.options.message}
        confirmText={modal.confirmModal.options.confirmText}
        cancelText={modal.confirmModal.options.cancelText}
        type={modal.confirmModal.options.type}
      />

      <PromptModal
        isOpen={modal.promptModal.isOpen}
        onClose={modal.closePrompt}
        onConfirm={modal.promptModal.onConfirm}
        title={modal.promptModal.options.title}
        message={modal.promptModal.options.message}
        placeholder={modal.promptModal.options.placeholder}
        initialValue={modal.promptModal.options.initialValue}
        confirmText={modal.promptModal.options.confirmText}
        cancelText={modal.promptModal.options.cancelText}
      />

      <NotificationModal
        isOpen={modal.notificationModal.isOpen}
        onClose={modal.closeNotification}
        title={modal.notificationModal.options.title}
        message={modal.notificationModal.options.message}
        type={modal.notificationModal.options.type}
      />

      {/* Request History Modal */}
      <RequestHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRecreateRequest={handleRequestFromHistory}
        onClearHistory={clearHistory}
        onRemoveEntry={removeEntry}
        onExportHistory={exportHistory}
        searchHistory={searchHistory}
        getStats={getStats}
      />
    </div>
  )
}

export default App
