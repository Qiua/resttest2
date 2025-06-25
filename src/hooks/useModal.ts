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

// src/hooks/useModal.ts
import { useState } from 'react'

interface ConfirmModalOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface PromptModalOptions {
  title: string
  message: string
  placeholder?: string
  initialValue?: string
  confirmText?: string
  cancelText?: string
}

interface NotificationModalOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
}

export const useModal = () => {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    options: ConfirmModalOptions
    onConfirm: () => void
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    onConfirm: () => {},
  })

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean
    options: PromptModalOptions
    onConfirm: (value: string) => void
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    onConfirm: () => {},
  })

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean
    options: NotificationModalOptions
  }>({
    isOpen: false,
    options: { title: '', message: '' },
  })

  const showConfirm = (options: ConfirmModalOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmModal({
        isOpen: true,
        options,
        onConfirm: () => {
          resolve(true)
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        },
      })
    })
  }

  const showPrompt = (options: PromptModalOptions): Promise<string | null> => {
    return new Promise(resolve => {
      setPromptModal({
        isOpen: true,
        options,
        onConfirm: (value: string) => {
          resolve(value)
          setPromptModal(prev => ({ ...prev, isOpen: false }))
        },
      })
    })
  }

  const showNotification = (options: NotificationModalOptions) => {
    setNotificationModal({
      isOpen: true,
      options,
    })
  }

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }

  const closePrompt = () => {
    setPromptModal(prev => ({ ...prev, isOpen: false }))
  }

  const closeNotification = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }))
  }

  return {
    // State
    confirmModal,
    promptModal,
    notificationModal,

    // Actions
    showConfirm,
    showPrompt,
    showNotification,
    closeConfirm,
    closePrompt,
    closeNotification,
  }
}
