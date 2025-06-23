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
    <div className='h-full flex flex-col'>
      <div className='border-b border-gray-200 flex-shrink-0'>
        <nav className='-mb-px flex space-x-4' aria-label='Tabs'>
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className='pt-4 flex-grow min-h-0 overflow-auto'>{tabs[activeTab] && tabs[activeTab].content}</div>
    </div>
  )
}
