// src/App.tsx
import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { RequestForm } from './features/RequestForm.tsx'
import { ResponseDisplay } from './features/ResponseDisplay'
import { type KeyValuePair, type Parameter, type ApiResponse } from './types'

function App() {
  // Estado para os campos do formulário
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [auth, setAuth] = useState<KeyValuePair | null>(null)
  const [headers, setHeaders] = useState<KeyValuePair[]>([])
  const [params, setParams] = useState<Parameter[]>([])

  // Estado para a resposta da API
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    const hasFiles = params.some((p) => 'file' in p && p.file)
    let data: FormData | URLSearchParams | undefined

    // Constrói os dados da requisição
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

    // Constrói os headers
    const requestHeaders: Record<string, string> = {}
    headers.forEach((h) => {
      if (h.key) requestHeaders[h.key] = h.value
    })

    try {
      const result = await axios({
        method: method,
        url: url,
        headers: requestHeaders,
        data: data,
        auth: auth ? { username: auth.key, password: auth.value } : undefined,
        // Para GET com parâmetros (alternativa)
        // params: method === 'GET' ? Object.fromEntries(params.filter(p => 'value' in p).map(p => [p.key, p.value])) : undefined,
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
    <div className='bg-gray-100 min-h-screen font-sans'>
      <nav className='bg-gray-800 text-white p-4 shadow-md'>
        <div className='container mx-auto'>
          <h1 className='text-xl font-bold'>REST test test... Refatorado!</h1>
        </div>
      </nav>

      <main className='container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div>
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
        </div>

        <div>
          <ResponseDisplay response={response} loading={loading} error={error} />
        </div>
      </main>
    </div>
  )
}

export default App
