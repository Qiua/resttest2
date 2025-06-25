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
import { FiRefreshCw } from 'react-icons/fi'
import axios, { AxiosError } from 'axios'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { RequestForm } from './features/RequestForm'
import { ResponseDisplay } from './features/ResponseDisplay'
import { Sidebar } from './components/Sidebar'
import { ThemeToggle } from './components/ThemeToggle'
import {
  type KeyValuePair,
  type Parameter,
  type ApiResponse,
  type AuthState,
  type SavedRequest,
  type BodyState,
  type Workspace,
  type Collection,
} from './types'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  // Estado da Requisição Atual
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [auth, setAuth] = useState<AuthState>({ type: 'none' })
  const [headers, setHeaders] = useState<KeyValuePair[]>([])
  const [params, setParams] = useState<Parameter[]>([])
  // Estado da Resposta e UI
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Estado do Corpo da Requisição
  const [body, setBody] = useState<BodyState>({ type: 'form-data', content: '' })

  // Estado das Requisições Salvas (mantido para compatibilidade)
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

  // Funções para manipular workspaces e collections
  const handleWorkspaceSelect = (workspaceId: string) => {
    setActiveWorkspace(workspaceId)
  }

  const handleNewCollection = (workspaceId: string) => {
    const name = prompt('Nome da nova collection:')
    if (!name?.trim()) return

    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name: name.trim(),
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

  const handleNewRequest = (collectionId?: string) => {
    const name = prompt('Nome da nova requisição:')
    if (!name?.trim()) return

    // Se não foi especificada uma collection, usa a primeira disponível
    const targetWorkspace = workspaces.find((w) => w.id === activeWorkspace)
    if (!targetWorkspace || targetWorkspace.collections.length === 0) {
      alert('Crie uma collection primeiro!')
      return
    }

    const targetCollectionId = collectionId || targetWorkspace.collections[0].id

    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name: name.trim(),
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
    setMethod(request.method || 'GET')
    setUrl(request.url || '')
    setAuth(request.auth || { type: 'none' })
    setHeaders(request.headers || [])
    setParams(request.params?.filter((p) => 'value' in p) || [])
    setBody(request.body || { type: 'form-data', content: '' })
  }

  const handleDeleteCollection = (collectionId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta collection? Todas as requisições serão perdidas.')) {
      return
    }

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

  const handleDeleteRequestFromSidebar = (requestId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta requisição?')) {
      return
    }

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
  const handleSaveCurrentRequest = () => {
    const name = prompt('Nome da requisição:')
    if (!name?.trim()) return

    const targetWorkspace = workspaces.find((w) => w.id === activeWorkspace)
    if (!targetWorkspace || targetWorkspace.collections.length === 0) {
      alert('Crie uma collection primeiro!')
      return
    }

    const targetCollectionId = targetWorkspace.collections[0].id // Usa a primeira collection

    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name: name.trim(),
      method,
      url,
      auth,
      headers,
      params,
      body,
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

    alert(`Requisição '${name}' salva na collection!`)
  }

  // Função para enviar a requisição
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    const tempHeaders = new Headers()
    let data: string | FormData | URLSearchParams | undefined

    // Define o corpo da requisição com base no tipo selecionado
    if (body.type === 'json' || body.type === 'xml' || body.type === 'text') {
      data = body.content
      // Define o Content-Type, a menos que o usuário já tenha definido um manualmente
      const contentTypeMap = {
        json: 'application/json',
        xml: 'application/xml',
        text: 'text/plain',
      }
      if (!headers.some((h) => h.key.toLowerCase() === 'content-type')) {
        tempHeaders.set('Content-Type', contentTypeMap[body.type])
      }
    } else if (body.type === 'form-data') {
      const hasFiles = params.some((p) => 'file' in p && p.file)
      if (hasFiles) {
        // Multipart/form-data
        const formData = new FormData()
        params.forEach((p) => {
          if ('file' in p && p.file) formData.append(p.key || `file_${p.id}`, p.file)
          else if ('value' in p) formData.append(p.key, p.value)
        })
        data = formData
        // O navegador define o Content-Type para multipart automaticamente
      } else {
        // application/x-www-form-urlencoded
        const searchParams = new URLSearchParams()
        params.forEach((p) => {
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
    headers.forEach((h) => {
      if (h.key) finalHeaders[h.key] = h.value
    })

    // Lógica de autorização não muda
    if (auth.type === 'bearer' && auth.token) {
      finalHeaders['Authorization'] = `Bearer ${auth.token}`
    }
    if (auth.type === 'api-key' && auth.apiKeyHeader && auth.apiKeyValue) {
      finalHeaders[auth.apiKeyHeader] = auth.apiKeyValue
    }

    // Only apply data to non-GET/HEAD requests if it hasn't been set already
    if (method !== 'GET' && method !== 'HEAD' && !data) {
      const hasFiles = params.some((p) => 'file' in p && p.file)
      if (hasFiles) {
        const formData = new FormData()
        params.forEach((p) => {
          if ('file' in p && p.file) {
            formData.append(p.key || `file_${p.id}`, p.file)
          } else if ('value' in p) {
            formData.append(p.key, p.value)
          }
        })
        data = formData
      } else {
        const searchParams = new URLSearchParams()
        params.forEach((p) => {
          if ('value' in p) {
            searchParams.append(p.key, p.value)
          }
        })
        data = searchParams
      }
    }
    const requestHeaders: Record<string, string> = {}
    headers.forEach((h) => {
      if (h.key) requestHeaders[h.key] = h.value
    })
    if (auth.type === 'bearer' && auth.token) {
      requestHeaders['Authorization'] = `Bearer ${auth.token}`
    }
    if (auth.type === 'api-key' && auth.apiKeyHeader && auth.apiKeyValue) {
      requestHeaders[auth.apiKeyHeader] = auth.apiKeyValue
    }
    try {
      const result = await axios({
        method: method,
        url: url,
        headers: requestHeaders,
        data: data,
        auth: auth.type === 'basic' ? { username: auth.username || '', password: auth.password || '' } : undefined,
      })
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

      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: JSON.stringify(result.headers, null, 2),
        body: responseBody,
        contentType: contentType,
      })
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const contentType = err.response.headers['content-type'] || ''
        let errorBody = err.response.data

        if (contentType.includes('application/json') && typeof errorBody === 'object') {
          errorBody = JSON.stringify(errorBody, null, 2)
        } else if (typeof errorBody !== 'string') {
          errorBody = String(errorBody)
        }

        setResponse({
          status: err.response.status,
          statusText: err.response.statusText,
          headers: JSON.stringify(err.response.headers, null, 2),
          body: errorBody,
          contentType: contentType,
        })
      } else {
        setError('Ocorreu um erro inesperado.')
      }
    } finally {
      setLoading(false)
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
        onNewCollection={handleNewCollection}
        onNewRequest={handleNewRequest}
        onDeleteCollection={handleDeleteCollection}
        onDeleteRequest={handleDeleteRequestFromSidebar}
      />

      {/* Área Principal */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Header compacto estilo profissional */}
        <header className='bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm dark:bg-gray-800 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>REST Test</h1>
            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300'>
              2.0
            </span>
          </div>

          {/* Controles do Header */}
          <div className='flex items-center gap-2'>
            {savedRequests.some((req) => !req.collectionId) && (
              <button
                onClick={migrateOldRequests}
                className='px-3 py-1.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors flex items-center gap-1'
                title='Migrar requests antigos para collections'
              >
                <FiRefreshCw className='w-3 h-3' />
                Migrar ({savedRequests.filter((req) => !req.collectionId).length})
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className='flex-1 min-h-0 p-2'>
          <PanelGroup
            direction='vertical'
            className='bg-white rounded-lg shadow-sm border border-gray-200 h-full dark:bg-gray-800 dark:border-gray-700'
          >
            <Panel defaultSize={50} minSize={20} className='overflow-hidden'>
              <RequestForm
                method={method}
                setMethod={setMethod}
                url={url}
                setUrl={setUrl}
                auth={auth}
                setAuth={setAuth}
                headers={headers}
                setHeaders={setHeaders}
                params={params}
                setParams={setParams}
                body={body}
                setBody={setBody}
                onSubmit={handleSubmit}
                onSave={handleSaveCurrentRequest}
                loading={loading}
              />
            </Panel>
            <PanelResizeHandle className='h-1 bg-gray-100 hover:bg-blue-500 data-[resize-handle-state=drag]:bg-blue-500 transition-colors border-y border-gray-200' />
            <Panel defaultSize={50} minSize={20} className='overflow-hidden'>
              <div className='h-full p-4'>
                <ResponseDisplay response={response} loading={loading} error={error} />
              </div>
            </Panel>
          </PanelGroup>
        </main>
      </div>
    </div>
  )
}

export default App
