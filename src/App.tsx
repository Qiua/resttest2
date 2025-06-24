// src/App.tsx
import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { RequestForm } from './features/RequestForm'
import { ResponseDisplay } from './features/ResponseDisplay'
import { SavedRequests } from './features/SavedRequests'
import { type KeyValuePair, type Parameter, type ApiResponse, type AuthState, type SavedRequest } from './types'
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

  // Estado das Requisições Salvas
  const [savedRequests, setSavedRequests] = useLocalStorage<SavedRequest[]>('savedRequests', [])

  // Funções para manipular as requisições salvas
  const handleSaveRequest = (name: string) => {
    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name,
      method,
      url,
      auth,
      headers,
      params,
    }
    setSavedRequests([...savedRequests, newRequest])
    alert(`Requisição '${name}' salva!`)
  }

  const handleLoadRequest = (id: string) => {
    const requestToLoad = savedRequests.find((req) => req.id === id)
    if (requestToLoad) {
      setMethod(requestToLoad.method)
      setUrl(requestToLoad.url)
      setAuth(requestToLoad.auth)
      setHeaders(requestToLoad.headers)
      setParams(requestToLoad.params.filter((p) => 'value' in p))
      alert(`Requisição '${requestToLoad.name}' carregada!`)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setSavedRequests(savedRequests.filter((req) => req.id !== id))
    alert('Requisição deletada.')
  }

  // Função para enviar a requisição
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    const hasFiles = params.some((p) => 'file' in p && p.file)
    let data: FormData | URLSearchParams | undefined
    if (method !== 'GET' && method !== 'HEAD') {
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

  return (
    <div className='h-screen grid grid-rows-[auto_auto_1fr] bg-gray-100 font-sans'>
      <nav className='bg-gray-800 text-white p-4 shadow-md'>
        <div className='container mx-auto'>
          <h1 className='text-xl font-bold'>REST Test 2.0</h1>
        </div>
      </nav>

      <div className='p-2'>
        <SavedRequests
          savedRequests={savedRequests}
          onSave={handleSaveRequest}
          onLoad={handleLoadRequest}
          onDelete={handleDeleteRequest}
        />
      </div>

      <main className='p-2 pt-0 min-h-0'>
        <PanelGroup direction='vertical' className='bg-white rounded-lg shadow-md h-full'>
          <Panel defaultSize={50} minSize={20} className='p-4 overflow-auto'>
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
              onSubmit={handleSubmit}
              loading={loading}
            />
          </Panel>
          <PanelResizeHandle className='h-2 bg-gray-200 hover:bg-blue-500 data-[resize-handle-state=drag]:bg-blue-500 transition-colors' />
          <Panel defaultSize={50} minSize={20} className='p-4 overflow-auto'>
            <ResponseDisplay response={response} loading={loading} error={error} />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  )
}

export default App
