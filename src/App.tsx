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
import { FiRefreshCw, FiSettings } from 'react-icons/fi'
import axios, { AxiosError } from 'axios'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { RequestForm } from './features/RequestForm'
import { ResponseDisplay } from './features/ResponseDisplay'
import { Sidebar } from './components/Sidebar'
import { RequestTabs } from './components/RequestTabs'
import { ThemeToggle } from './components/ThemeToggle'
import { LanguageSelector } from './components/LanguageSelector'
import { ImportExportModal } from './components/ImportExportModal'
import { ProxySettings } from './components/ProxySettings'
import { ConfirmModal } from './components/ConfirmModal'
import { PromptModal } from './components/PromptModal'
import { NotificationModal } from './components/NotificationModal'
import { type SavedRequest, type Workspace, type Collection } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useRequestTabs } from './hooks/useRequestTabs'
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
      message: t('sidebar.newWorkspace') + ':',
      placeholder: t('sidebar.workspaceName'),
    })
    if (!name) return

    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name: name,
      description: '',
      collections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces((prev) => [...prev, newWorkspace])
    setActiveWorkspace(newWorkspace.id)
  }

  const handleWorkspaceSelect = (workspaceId: string) => {
    setActiveWorkspace(workspaceId)
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId)
    if (!workspace) return

    const confirmed = await modal.showConfirm({
      title: t('messages.confirmDeleteWorkspace'),
      message: t('messages.confirmDeleteWorkspaceMessage', { name: workspace.name }),
      type: 'danger',
      confirmText: t('common.delete'),
    })

    if (!confirmed) return

    setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId))

    // Se o workspace ativo foi deletado, selecionar outro
    if (activeWorkspace === workspaceId) {
      const remaining = workspaces.filter((w) => w.id !== workspaceId)
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

  const handleNewCollection = async (workspaceId: string) => {
    const name = await modal.showPrompt({
      title: t('sidebar.newCollection'),
      message: t('sidebar.newCollection') + ':',
      placeholder: t('sidebar.collectionName'),
    })
    if (!name) return

    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name: name,
      description: '',
      requests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              collections: [...workspace.collections, newCollection],
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
    )
  }

  const handleNewRequest = async (collectionId?: string) => {
    const name = await modal.showPrompt({
      title: t('sidebar.addRequest'),
      message: t('sidebar.addRequest') + ':',
      placeholder: t('sidebar.requestName'),
    })
    if (!name) return

    // Se não foi especificada uma collection, usa a primeira disponível
    const targetWorkspace = workspaces.find((w) => w.id === activeWorkspace)
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
      name: name,
      method: 'GET',
      url: 'https://httpbin.org/get',
      auth: { type: 'none' },
      headers: [],
      params: [],
      body: { type: 'form-data', content: '' },
      collectionId: targetCollectionId,
    }

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map((collection) =>
                collection.id === targetCollectionId
                  ? {
                      ...collection,
                      requests: [...collection.requests, newRequest],
                      updatedAt: new Date().toISOString(),
                    }
                  : collection
              ),
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
    )
  }

  const handleRequestSelect = (request: SavedRequest) => {
    // Abrir a requisição em uma nova aba
    createNewTab(request)
  }

  const handleDeleteCollection = async (collectionId: string) => {
    const confirmed = await modal.showConfirm({
      title: t('messages.confirmDeleteCollection'),
      message: t('messages.confirmDeleteCollectionMessage'),
      type: 'danger',
      confirmText: t('common.delete'),
    })

    if (!confirmed) return

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.filter((c) => c.id !== collectionId),
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
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

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map((collection) => ({
                ...collection,
                requests: collection.requests.filter((r) => r.id !== requestId),
                updatedAt: new Date().toISOString(),
              })),
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
    )
  }

  // Função para salvar requisição no sistema de collections
  const handleSaveCurrentRequest = async () => {
    const activeTab = getActiveTab()
    if (!activeTab) return

    const name = await modal.showPrompt({
      title: t('messages.requestName'),
      message: t('messages.requestName') + ':',
      placeholder: t('sidebar.requestName'),
    })
    if (!name) return

    const targetWorkspace = workspaces.find((w) => w.id === activeWorkspace)
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
      name: name,
      method: activeTab.method,
      url: activeTab.url,
      auth: activeTab.auth,
      headers: activeTab.headers,
      params: activeTab.params,
      body: activeTab.body,
      collectionId: targetCollectionId,
    }

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map((collection) =>
                collection.id === targetCollectionId
                  ? {
                      ...collection,
                      requests: [...collection.requests, newRequest],
                      updatedAt: new Date().toISOString(),
                    }
                  : collection
              ),
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
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

    // Definir estado de loading na aba
    setTabResponse(activeTab.id, null, true, null)

    const tempHeaders = new Headers()
    let data: string | FormData | URLSearchParams | undefined

    // Define o corpo da requisição com base no tipo selecionado
    if (activeTab.body.type === 'json' || activeTab.body.type === 'xml' || activeTab.body.type === 'text') {
      data = activeTab.body.content
      // Define o Content-Type, a menos que o usuário já tenha definido um manualmente
      const contentTypeMap = {
        json: 'application/json',
        xml: 'application/xml',
        text: 'text/plain',
      }
      if (!activeTab.headers.some((h) => h.key.toLowerCase() === 'content-type')) {
        tempHeaders.set('Content-Type', contentTypeMap[activeTab.body.type])
      }
    } else if (activeTab.body.type === 'form-data') {
      const hasFiles = activeTab.params.some((p) => 'file' in p && p.file)
      if (hasFiles) {
        // Multipart/form-data
        const formData = new FormData()
        activeTab.params.forEach((p) => {
          if ('file' in p && p.file) formData.append(p.key || `file_${p.id}`, p.file)
          else if ('value' in p) formData.append(p.key, p.value)
        })
        data = formData
        // O navegador define o Content-Type para multipart automaticamente
      } else {
        // application/x-www-form-urlencoded
        const searchParams = new URLSearchParams()
        activeTab.params.forEach((p) => {
          if ('value' in p) searchParams.append(p.key, p.value)
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
    activeTab.headers.forEach((h) => {
      if (h.key) finalHeaders[h.key] = h.value
    })

    // Lógica de autorização
    if (activeTab.auth.type === 'bearer' && activeTab.auth.token) {
      finalHeaders['Authorization'] = `Bearer ${activeTab.auth.token}`
    }
    if (activeTab.auth.type === 'api-key' && activeTab.auth.apiKeyHeader && activeTab.auth.apiKeyValue) {
      finalHeaders[activeTab.auth.apiKeyHeader] = activeTab.auth.apiKeyValue
    }

    // Only apply data to non-GET/HEAD requests if it hasn't been set already
    if (activeTab.method !== 'GET' && activeTab.method !== 'HEAD' && !data) {
      const hasFiles = activeTab.params.some((p) => 'file' in p && p.file)
      if (hasFiles) {
        const formData = new FormData()
        activeTab.params.forEach((p) => {
          if ('file' in p && p.file) {
            formData.append(p.key || `file_${p.id}`, p.file)
          } else if ('value' in p) {
            formData.append(p.key, p.value)
          }
        })
        data = formData
      } else {
        const searchParams = new URLSearchParams()
        activeTab.params.forEach((p) => {
          if ('value' in p) {
            searchParams.append(p.key, p.value)
          }
        })
        data = searchParams
      }
    }

    const requestHeaders: Record<string, string> = {}
    activeTab.headers.forEach((h) => {
      if (h.key) requestHeaders[h.key] = h.value
    })
    if (activeTab.auth.type === 'bearer' && activeTab.auth.token) {
      requestHeaders['Authorization'] = `Bearer ${activeTab.auth.token}`
    }
    if (activeTab.auth.type === 'api-key' && activeTab.auth.apiKeyHeader && activeTab.auth.apiKeyValue) {
      requestHeaders[activeTab.auth.apiKeyHeader] = activeTab.auth.apiKeyValue
    }

    try {
      // Aplicar proxy se configurado
      const finalUrl = applyProxy(activeTab.url, proxyConfig)

      // Configurar axios para o proxy
      const axiosConfig = configureAxiosForProxy(
        {
          method: activeTab.method,
          url: finalUrl,
          headers: requestHeaders,
          data: data,
          auth:
            activeTab.auth.type === 'basic'
              ? { username: activeTab.auth.username || '', password: activeTab.auth.password || '' }
              : undefined,
        },
        proxyConfig
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
          contentType: contentType,
        },
        false,
        null
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
            contentType: contentType,
          },
          false,
          null
        )
      } else {
        setTabResponse(activeTab.id, null, false, t('common.unexpectedError'))
      }
    }
  }

  // Função para migrar requests antigos para o sistema de collections
  const migrateOldRequests = () => {
    const requestsToMigrate = savedRequests.filter((req) => !req.collectionId)

    if (requestsToMigrate.length === 0) return

    const targetWorkspace = workspaces.find((w) => w.id === activeWorkspace)
    if (!targetWorkspace || targetWorkspace.collections.length === 0) return

    const targetCollectionId = targetWorkspace.collections[0].id

    const migratedRequests = requestsToMigrate.map((req) => ({
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

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === activeWorkspace
          ? {
              ...workspace,
              collections: workspace.collections.map((collection) =>
                collection.id === targetCollectionId
                  ? {
                      ...collection,
                      requests: [...collection.requests, ...migratedRequests],
                      updatedAt: new Date().toISOString(),
                    }
                  : collection
              ),
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
    )

    // Remove os requests antigos ou marca como migrados
    setSavedRequests((prev) =>
      prev.map((req) =>
        requestsToMigrate.find((migrated) => migrated.id === req.id)
          ? { ...req, collectionId: targetCollectionId }
          : req
      )
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

    setWorkspaces((prev) => [...prev, newWorkspace])
    setActiveWorkspace(newWorkspace.id)
  }

  const handleCollectionImported = (collection: Collection, workspaceId: string) => {
    // Gerar um novo ID para a collection para evitar conflitos
    const newCollection = {
      ...collection,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    }

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              collections: [...workspace.collections, newCollection],
              updatedAt: new Date().toISOString(),
            }
          : workspace
      )
    )
  }

  return (
    <div className='h-screen flex bg-gray-50 dark:bg-gray-900'>
      {/* Sidebar */}
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

      {/* Área Principal */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Header compacto estilo profissional */}
        <header className='bg-white border-b border-gray-200 px-3 py-1.5 flex items-center justify-between shadow-sm dark:bg-gray-800 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>REST Test</h1>
            <span className='text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300'>
              2.0
            </span>
          </div>

          {/* Controles do Header */}
          <div className='flex items-center gap-1'>
            {savedRequests.some((req) => !req.collectionId) && (
              <button
                onClick={migrateOldRequests}
                className='px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors flex items-center gap-1 cursor-pointer'
                title='Migrar requests antigos para collections'
              >
                <FiRefreshCw className='w-3 h-3' />
                Migrar ({savedRequests.filter((req) => !req.collectionId).length})
              </button>
            )}
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setProxySettingsOpen(true)}
                className='p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer'
                title={t('proxy.settings')}
              >
                <FiSettings size={16} />
              </button>
              <LanguageSelector />
              <ThemeToggle />
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

        {/* Conteúdo Principal */}
        <main className='flex-1 min-h-0 p-1'>
          <PanelGroup
            direction='vertical'
            className='bg-white rounded-lg shadow-sm border border-gray-200 h-full dark:bg-gray-800 dark:border-gray-700'
          >
            <Panel defaultSize={50} minSize={20} className='overflow-hidden'>
              {getActiveTab() && (
                <RequestForm
                  method={getActiveTab()!.method}
                  setMethod={(method) => updateTab(activeTabId!, { method })}
                  url={getActiveTab()!.url}
                  setUrl={(url) => updateTab(activeTabId!, { url })}
                  auth={getActiveTab()!.auth}
                  setAuth={(auth) => updateTab(activeTabId!, { auth })}
                  headers={getActiveTab()!.headers}
                  setHeaders={(headers) => updateTab(activeTabId!, { headers })}
                  params={getActiveTab()!.params}
                  setParams={(params) => updateTab(activeTabId!, { params })}
                  body={getActiveTab()!.body}
                  setBody={(body) => updateTab(activeTabId!, { body })}
                  onSubmit={handleSubmit}
                  onSave={handleSaveCurrentRequest}
                  loading={getActiveTab()!.loading || false}
                  proxyConfig={proxyConfig}
                  onProxySettings={() => setProxySettingsOpen(true)}
                />
              )}
            </Panel>
            <PanelResizeHandle className='h-1 bg-gray-100 hover:bg-blue-500 data-[resize-handle-state=drag]:bg-blue-500 transition-colors border-y border-gray-200' />
            <Panel defaultSize={50} minSize={20} className='overflow-hidden'>
              <div className='h-full p-3'>
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
    </div>
  )
}

export default App
