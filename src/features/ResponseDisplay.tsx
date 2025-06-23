// src/features/ResponseDisplay.tsx
import React from 'react'
import type { ApiResponse } from '../types'
import { Tabs } from '../components/Tabs'

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
    return <div className='p-4 text-gray-500'>Carregando...</div>
  }

  if (error) {
    return (
      <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4' role='alert'>
        <p className='font-bold'>Erro!</p>
        <p>{error}</p>
      </div>
    )
  }

  if (!response) {
    return <div className='p-4 text-gray-500'>A resposta da sua requisição aparecerá aqui.</div>
  }

  const responseTabs = [
    {
      label: 'Corpo',
      content: (
        <pre className='p-2 rounded-md bg-gray-900 text-white text-sm'>
          <code>{response.body}</code>
        </pre>
      ),
    },
    {
      label: 'Headers',
      content: (
        <pre className='p-2 rounded-md bg-gray-900 text-white text-sm'>
          <code>{response.headers}</code>
        </pre>
      ),
    },
  ]

  return (
    <div className='space-y-4 h-full flex flex-col'>
      <div className='flex-shrink-0'>
        <h3 className='text-lg font-medium text-gray-700 mb-2'>Status da Resposta</h3>
        <pre className={`p-3 rounded-md overflow-x-auto text-sm font-semibold ${getStatusClass(response.status)}`}>
          HTTP {response.status} {response.statusText}
        </pre>
      </div>
      <div className='flex-grow min-h-0'>
        <Tabs tabs={responseTabs} />
      </div>
    </div>
  )
}
