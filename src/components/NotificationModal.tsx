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

// src/components/NotificationModal.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
}) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const typeConfig = {
    success: {
      icon: FiCheckCircle,
      colors: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    },
    error: {
      icon: FiAlertCircle,
      colors: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    },
    info: {
      icon: FiInfo,
      colors: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    },
  }

  const config = typeConfig[type]
  const IconComponent = config.icon

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer'
      onClick={handleBackdropClick}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 cursor-default'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg ${config.colors}`}>
              <IconComponent size={20} />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer'
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='p-4'>
          <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>{message}</p>
        </div>

        {/* Action */}
        <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={onClose}
            className='w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer'
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
