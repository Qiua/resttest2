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
// src/components/Tabs.tsx
import React from 'react'

interface Tab {
  label: string
  content: React.ReactNode
}
interface TabsProps {
  tabs: Tab[]
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = React.useState(0)

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* Barra de Abas - Estilo Postman */}
      <div className='border-b border-gray-200 bg-gray-50'>
        <nav className='flex' aria-label='Tabs'>
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type='button'
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              } px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors relative`}
            >
              {tab.label}
              {/* Indicador ativo */}
              {activeTab === index && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500'></div>}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da Aba */}
      <div className='flex-1 min-h-0 overflow-auto p-4'>{tabs[activeTab] && tabs[activeTab].content}</div>
    </div>
  )
}
