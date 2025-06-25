/*
    REST Test 2.0 - CORS Proxy Settings Component
    Copyright (C) 2025  Andrey Aires @ Gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
*/

// src/components/ProxySettings.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSettings, FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiExternalLink, FiLoader } from 'react-icons/fi'
import {
  type ProxyConfig,
  type ProxyOption,
  AVAILABLE_PROXIES,
  testProxy,
  mayHaveCorsIssues,
  getCorsAdvice,
} from '../utils/corsProxy'

interface ProxySettingsProps {
  isOpen: boolean
  onClose: () => void
  proxyConfig: ProxyConfig
  onConfigChange: (config: ProxyConfig) => void
  currentUrl: string
}

export const ProxySettings: React.FC<ProxySettingsProps> = ({
  isOpen,
  onClose,
  proxyConfig,
  onConfigChange,
  currentUrl,
}) => {
  const { t } = useTranslation()
  const [testingProxy, setTestingProxy] = useState<ProxyOption | null>(null)
  const [testResults, setTestResults] = useState<Record<ProxyOption, boolean | null>>({
    none: null,
    'vite-local': null,
    'cors-anywhere': null,
    allorigins: null,
    custom: null,
  })

  const handleProxyTypeChange = (type: ProxyOption) => {
    onConfigChange({
      ...proxyConfig,
      type,
      enabled: type !== 'none',
    })
  }

  const handleCustomUrlChange = (customUrl: string) => {
    onConfigChange({
      ...proxyConfig,
      customUrl,
    })
  }

  const handleTestProxy = async (type: ProxyOption) => {
    setTestingProxy(type)

    try {
      const result = await testProxy(type, type === 'custom' ? proxyConfig.customUrl : undefined)

      setTestResults(prev => ({
        ...prev,
        [type]: result,
      }))
    } catch {
      setTestResults(prev => ({
        ...prev,
        [type]: false,
      }))
    } finally {
      setTestingProxy(null)
    }
  }

  const corsWarning = mayHaveCorsIssues(currentUrl)
  const corsAdvice = getCorsAdvice(currentUrl)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 cursor-default">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FiSettings className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('proxy.settings')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          {/* CORS Warning */}
          {corsWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">{t('proxy.corsWarning')}</h3>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {corsAdvice.map((advice, index) => (
                      <li key={index}>• {advice}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Current URL Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">{t('proxy.currentUrl')}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 break-all">{currentUrl}</p>
              </div>
            </div>
          </div>

          {/* Proxy Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('proxy.options')}</h3>

            {/* No Proxy */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="proxy"
                  checked={proxyConfig.type === 'none'}
                  onChange={() => handleProxyTypeChange('none')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('proxy.noProxy')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('proxy.noProxyDescription')}</p>
                </div>
              </label>
            </div>

            {/* Available Proxies */}
            {Object.entries(AVAILABLE_PROXIES).map(([key, proxy]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 ${
                  proxyConfig.type === key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="proxy"
                    checked={proxyConfig.type === key}
                    onChange={() => handleProxyTypeChange(key as ProxyOption)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{proxy.name}</h4>
                      <div className="flex items-center gap-2">
                        {testResults[key as ProxyOption] === true && (
                          <FiCheckCircle className="text-green-500" size={16} />
                        )}
                        {testResults[key as ProxyOption] === false && (
                          <FiAlertTriangle className="text-red-500" size={16} />
                        )}
                        <button
                          onClick={() => handleTestProxy(key as ProxyOption)}
                          disabled={testingProxy !== null}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          {testingProxy === key ? (
                            <FiLoader className="animate-spin" size={14} />
                          ) : (
                            <FiExternalLink size={14} />
                          )}
                          {t('proxy.test')}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{proxy.description}</p>

                    {proxy.requiresDemo && (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">{t('proxy.requiresDemo')}</div>
                    )}

                    {key === 'custom' && proxyConfig.type === 'custom' && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="https://my-proxy-server.com"
                          value={proxyConfig.customUrl || ''}
                          onChange={e => handleCustomUrlChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{t('proxy.important')}</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• {t('proxy.developmentOnly')}</li>
              <li>• {t('proxy.productionAdvice')}</li>
              <li>• {t('proxy.privacyWarning')}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
