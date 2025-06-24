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
// src/features/ResponseDisplay.tsx
import React from 'react'
import type { ApiResponse } from '../types'
import { Tabs } from '../components/Tabs'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

  const isJson = response?.contentType?.includes('application/json')

  const responseTabs = [
    {
      label: 'Corpo',
      content: isJson ? (
        // Se for JSON, use o SyntaxHighlighter
        <SyntaxHighlighter
          language='json'
          style={codeStyle}
          customStyle={{ margin: 0, padding: '1rem', height: '100%', borderRadius: '0.375rem' }}
        >
          {response.body}
        </SyntaxHighlighter>
      ) : (
        // Se não for, use um <pre> simples
        <pre className='p-4 rounded-md bg-gray-900 text-white text-sm h-full overflow-auto'>
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
