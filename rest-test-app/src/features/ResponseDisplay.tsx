// src/features/ResponseDisplay.tsx
import React from 'react'
import type { ApiResponse } from '../types'

interface ResponseDisplayProps {
  response: ApiResponse | null
  loading: boolean
  error: string | null
}

const getStatusClass = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-800'
  if (status >= 400) return 'bg-red-100 text-red-800'
  if (status >= 300) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-800'
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, loading, error }) => {
  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Carregando...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md' role='alert'>
        <p className='font-bold'>Erro!</p>
        <p>{error}</p>
      </div>
    )
  }

  if (!response) {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md text-center text-gray-500'>
        <p>A resposta da sua requisição aparecerá aqui.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Status</h2>
        <pre className={`p-4 rounded-md overflow-x-auto text-sm ${getStatusClass(response.status)}`}>
          HTTP {response.status} {response.statusText}
        </pre>
      </div>
      <div>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Corpo da Resposta</h2>
        <pre className='p-4 rounded-md bg-gray-800 text-white overflow-x-auto text-sm max-h-96'>
          <code>{response.body}</code>
        </pre>
      </div>
      <div>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Headers da Resposta</h2>
        <pre className='p-4 rounded-md bg-gray-800 text-white overflow-x-auto text-sm max-h-64'>
          <code>{response.headers}</code>
        </pre>
      </div>
    </div>
  )
}
