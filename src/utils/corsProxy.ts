/*
    REST Test 2.0 - CORS Proxy Utilities
    Copyright (C) 2025  Andrey Aires @ Gmail.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
*/

// src/utils/corsProxy.ts
import type { AxiosRequestConfig } from 'axios'

export type ProxyOption = 'none' | 'vite-local' | 'cors-anywhere' | 'allorigins' | 'custom'

export interface ProxyConfig {
  type: ProxyOption
  customUrl?: string
  enabled: boolean
}

// Lista de proxies públicos disponíveis
export const AVAILABLE_PROXIES = {
  'vite-local': {
    name: 'Proxy Local (Vite)',
    url: '/api/',
    description: 'Proxy local do Vite (recomendado para desenvolvimento)',
    requiresDemo: false,
  },
  'cors-anywhere': {
    name: 'CORS Anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    description: 'Proxy público para desenvolvimento (limitado)',
    requiresDemo: true,
  },
  allorigins: {
    name: 'AllOrigins',
    url: 'https://api.allorigins.win/get?url=',
    description: 'Proxy público que retorna JSON',
    requiresDemo: false,
  },
  custom: {
    name: 'Proxy Personalizado',
    url: '',
    description: 'Configure seu próprio servidor proxy',
    requiresDemo: false,
  },
} as const

/**
 * Aplica configuração de proxy à URL da requisição
 */
export function applyProxy(url: string, proxyConfig: ProxyConfig): string {
  if (!proxyConfig.enabled || proxyConfig.type === 'none') {
    return url
  }

  switch (proxyConfig.type) {
    case 'vite-local':
      // Para o proxy local do Vite, detecta o tipo de API e aplica o prefixo correto
      if (url.includes('anatel.gov.br')) {
        return url.replace('https://sistemas.anatel.gov.br', '/api/anatel')
      }
      // Para outras URLs, usa o proxy genérico
      return `/api/cors-proxy/${url}`

    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`

    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

    case 'custom':
      if (proxyConfig.customUrl) {
        // Remove trailing slash do proxy URL
        const proxyBase = proxyConfig.customUrl.replace(/\/$/, '')
        return `${proxyBase}/${url}`
      }
      return url

    default:
      return url
  }
}

/**
 * Modifica a configuração do axios para lidar com proxies
 */
export function configureAxiosForProxy(config: AxiosRequestConfig, proxyConfig: ProxyConfig): AxiosRequestConfig {
  const modifiedConfig = { ...config }

  if (proxyConfig.enabled && proxyConfig.type === 'allorigins') {
    // AllOrigins retorna os dados encapsulados
    modifiedConfig.transformResponse = [
      ...(Array.isArray(config.transformResponse) ? config.transformResponse : []),
      (data: string) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.contents) {
            // Tenta fazer parse do conteúdo se for JSON
            try {
              return JSON.parse(parsed.contents)
            } catch {
              return parsed.contents
            }
          }
          return parsed
        } catch {
          return data
        }
      },
    ]
  }

  return modifiedConfig
}

/**
 * Detecta se uma URL pode ter problemas de CORS
 */
export function mayHaveCorsIssues(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const currentOrigin = window.location.origin
    const targetOrigin = urlObj.origin

    return currentOrigin !== targetOrigin
  } catch {
    return false
  }
}

/**
 * Gera sugestões de solução para problemas de CORS
 */
export function getCorsAdvice(url: string): string[] {
  const advice = []

  if (mayHaveCorsIssues(url)) {
    advice.push('Esta requisição pode falhar devido a restrições CORS')
    advice.push('Considere usar um proxy para desenvolvimento')
    advice.push('Em produção, configure CORS no servidor de destino')
    advice.push('Ou implemente um proxy server no backend')
  }

  return advice
}

/**
 * Testa se um proxy está funcionando
 */
export async function testProxy(proxyType: ProxyOption, customUrl?: string): Promise<boolean> {
  const testUrl = 'https://httpbin.org/get'
  const proxyConfig: ProxyConfig = {
    type: proxyType,
    customUrl,
    enabled: true,
  }

  try {
    const proxiedUrl = applyProxy(testUrl, proxyConfig)
    const response = await fetch(proxiedUrl, {
      method: 'GET',
      mode: 'cors',
    })

    return response.ok
  } catch {
    return false
  }
}
