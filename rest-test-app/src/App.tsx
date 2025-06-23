// src/App.tsx
import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { RequestForm } from './features/RequestForm'
import { ResponseDisplay } from './features/ResponseDisplay'
import { type KeyValuePair, type Parameter, type ApiResponse, type AuthState } from './types'

function App() {
  // Todo o seu estado e a função handleSubmit permanecem exatamente iguais.
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [auth, setAuth] = useState<AuthState>({ type: 'none' })
  const [headers, setHeaders] = useState<KeyValuePair[]>([])
  const [params, setParams] = useState<Parameter[]>([])
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // A lógica de submit não muda
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
    try {
      const result = await axios({
        method: method,
        url: url,
        headers: requestHeaders,
        data: data,
        auth: auth.type === 'basic' ? { username: auth.username || '', password: auth.password || '' } : undefined,
      })
      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: JSON.stringify(result.headers, null, 2),
        body: JSON.stringify(result.data, null, 2),
      })
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response) {
          setResponse({
            status: err.response.status,
            statusText: err.response.statusText,
            headers: JSON.stringify(err.response.headers, null, 2),
            body: JSON.stringify(err.response.data, null, 2),
          })
        } else if (err.request) {
          setError('A requisição foi feita, mas nenhuma resposta foi recebida. Verifique a rede ou o CORS.')
        } else {
          setError(`Erro ao configurar a requisição: ${err.message}`)
        }
      } else {
        setError('Ocorreu um erro inesperado.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    // MUDANÇA PRINCIPAL: Usando CSS Grid para o layout da página.
    // h-screen -> Garante que o container ocupe toda a altura da tela.
    // grid grid-rows-[auto_1fr] -> Define 2 linhas: a primeira ('auto') com a altura do seu conteúdo (o nav),
    // e a segunda ('1fr') para ocupar todo o resto do espaço.
    <div className='h-screen grid grid-rows-[auto_1fr] bg-gray-100 font-sans'>
      {/* A nav agora é o primeiro item do grid. */}
      <nav className='bg-gray-800 text-white p-4 shadow-md'>
        <div className='container mx-auto'>
          <h1 className='text-xl font-bold'>REST Test 2.0</h1>
        </div>
      </nav>

      {/* O main é o segundo item do grid, que se estica. */}
      {/* min-h-0 é importante para que o conteúdo interno com scroll funcione bem. */}
      <main className='p-2 min-h-0'>
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
