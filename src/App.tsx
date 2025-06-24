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
import axios, { AxiosError } from 'axios'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { RequestForm } from './features/RequestForm'
import { ResponseDisplay } from './features/ResponseDisplay'
import { SavedRequests } from './features/SavedRequests'
import {
  type KeyValuePair,
  type Parameter,
  type ApiResponse,
  type AuthState,
  type SavedRequest,
  type BodyState,
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
      body,
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
      setBody(requestToLoad.body)
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
              body={body}
              setBody={setBody}
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
