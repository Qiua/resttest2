/*
    REST Test 2.0 - Environment Management Hook
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

// src/hooks/useEnvironments.ts
import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Environment, EnvironmentVariable } from '../types'

interface UseEnvironmentsReturn {
  environments: Environment[]
  activeEnvironmentId: string | null
  globalEnvironment: Environment | null
  activeEnvironment: Environment | null

  // Environment management
  createEnvironment: (name: string, description?: string) => Environment
  updateEnvironment: (id: string, updates: Partial<Omit<Environment, 'id' | 'createdAt'>>) => void
  deleteEnvironment: (id: string) => void
  setActiveEnvironment: (id: string | null) => void
  duplicateEnvironment: (id: string, newName: string) => Environment

  // Variable management
  addVariable: (environmentId: string, variable: Omit<EnvironmentVariable, 'key'> & { key: string }) => void
  updateVariable: (environmentId: string, oldKey: string, variable: EnvironmentVariable) => void
  deleteVariable: (environmentId: string, key: string) => void

  // Variable resolution
  resolveVariables: (text: string) => string
  getVariableValue: (key: string) => string | undefined
  getAllAvailableVariables: () => EnvironmentVariable[]

  // Bulk operations
  importEnvironment: (environment: Environment) => void
  exportEnvironment: (id: string) => Environment | null
  exportAllEnvironments: () => Environment[]

  // Utility
  hasVariables: (text: string) => boolean
  validateVariableName: (name: string) => { isValid: boolean; error?: string }
}

export const useEnvironments = (): UseEnvironmentsReturn => {
  const [environments, setEnvironments] = useLocalStorage<Environment[]>('environments', [])
  const [activeEnvironmentId, setActiveEnvironmentId] = useLocalStorage<string | null>('activeEnvironmentId', null)

  // Criar ambiente global se não existir
  const ensureGlobalEnvironment = useCallback(() => {
    const globalEnv = environments.find(env => env.isGlobal)
    if (!globalEnv) {
      const newGlobalEnv: Environment = {
        id: 'global',
        name: 'Global Variables',
        description: 'Variables available in all environments',
        variables: [],
        isGlobal: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setEnvironments(prev => [newGlobalEnv, ...prev])
      return newGlobalEnv
    }
    return globalEnv
  }, [environments, setEnvironments])

  // Ambiente global
  const globalEnvironment = useMemo(() => {
    return environments.find(env => env.isGlobal) || ensureGlobalEnvironment()
  }, [environments, ensureGlobalEnvironment])

  // Ambiente ativo
  const activeEnvironment = useMemo(() => {
    if (!activeEnvironmentId) return null
    return environments.find(env => env.id === activeEnvironmentId) || null
  }, [environments, activeEnvironmentId])

  // Criar ambiente
  const createEnvironment = useCallback(
    (name: string, description?: string): Environment => {
      const newEnvironment: Environment = {
        id: crypto.randomUUID(),
        name,
        description,
        variables: [],
        isGlobal: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setEnvironments(prev => [...prev, newEnvironment])
      return newEnvironment
    },
    [setEnvironments],
  )

  // Atualizar ambiente
  const updateEnvironment = useCallback(
    (id: string, updates: Partial<Omit<Environment, 'id' | 'createdAt'>>) => {
      setEnvironments(prev =>
        prev.map(env =>
          env.id === id
            ? {
                ...env,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : env,
        ),
      )
    },
    [setEnvironments],
  )

  // Deletar ambiente
  const deleteEnvironment = useCallback(
    (id: string) => {
      // Não permitir deletar ambiente global
      if (id === 'global') return

      setEnvironments(prev => prev.filter(env => env.id !== id))

      // Se deletar o ambiente ativo, resetar para null
      if (activeEnvironmentId === id) {
        setActiveEnvironmentId(null)
      }
    },
    [setEnvironments, activeEnvironmentId, setActiveEnvironmentId],
  )

  // Duplicar ambiente
  const duplicateEnvironment = useCallback(
    (id: string, newName: string): Environment => {
      const envToDuplicate = environments.find(env => env.id === id)
      if (!envToDuplicate) throw new Error('Environment not found')

      const newEnvironment: Environment = {
        ...envToDuplicate,
        id: crypto.randomUUID(),
        name: newName,
        isGlobal: false, // Nunca duplicar como global
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setEnvironments(prev => [...prev, newEnvironment])
      return newEnvironment
    },
    [environments, setEnvironments],
  )

  // Adicionar variável
  const addVariable = useCallback(
    (environmentId: string, variable: EnvironmentVariable) => {
      updateEnvironment(environmentId, {
        variables: [...(environments.find(env => env.id === environmentId)?.variables || []), variable],
      })
    },
    [environments, updateEnvironment],
  )

  // Atualizar variável
  const updateVariable = useCallback(
    (environmentId: string, oldKey: string, variable: EnvironmentVariable) => {
      const env = environments.find(env => env.id === environmentId)
      if (!env) return

      const updatedVariables = env.variables.map(v => (v.key === oldKey ? variable : v))

      updateEnvironment(environmentId, { variables: updatedVariables })
    },
    [environments, updateEnvironment],
  )

  // Deletar variável
  const deleteVariable = useCallback(
    (environmentId: string, key: string) => {
      const env = environments.find(env => env.id === environmentId)
      if (!env) return

      const updatedVariables = env.variables.filter(v => v.key !== key)
      updateEnvironment(environmentId, { variables: updatedVariables })
    },
    [environments, updateEnvironment],
  )

  // Obter valor de variável (busca no ambiente ativo primeiro, depois global)
  const getVariableValue = useCallback(
    (key: string): string | undefined => {
      // Primeiro buscar no ambiente ativo
      if (activeEnvironment) {
        const variable = activeEnvironment.variables.find(v => v.key === key)
        if (variable) return variable.value
      }

      // Depois buscar no ambiente global
      if (globalEnvironment) {
        const variable = globalEnvironment.variables.find(v => v.key === key)
        if (variable) return variable.value
      }

      return undefined
    },
    [activeEnvironment, globalEnvironment],
  )

  // Resolver variáveis em texto
  const resolveVariables = useCallback(
    (text: string): string => {
      if (!text) return text

      return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
        const value = getVariableValue(varName.trim())
        return value !== undefined ? value : match // Manter {{varName}} se não encontrar
      })
    },
    [getVariableValue],
  )

  // Verificar se texto tem variáveis
  const hasVariables = useCallback((text: string): boolean => {
    return /\{\{[^}]+\}\}/.test(text)
  }, [])

  // Obter todas as variáveis disponíveis
  const getAllAvailableVariables = useCallback((): EnvironmentVariable[] => {
    const variables: EnvironmentVariable[] = []

    // Adicionar variáveis globais
    if (globalEnvironment) {
      variables.push(...globalEnvironment.variables)
    }

    // Adicionar variáveis do ambiente ativo (sobrescreve globais se mesmo nome)
    if (activeEnvironment) {
      activeEnvironment.variables.forEach(envVar => {
        const existingIndex = variables.findIndex(v => v.key === envVar.key)
        if (existingIndex >= 0) {
          variables[existingIndex] = envVar // Sobrescrever
        } else {
          variables.push(envVar)
        }
      })
    }

    return variables
  }, [activeEnvironment, globalEnvironment])

  // Validar nome de variável
  const validateVariableName = useCallback((name: string): { isValid: boolean; error?: string } => {
    if (!name.trim()) {
      return { isValid: false, error: 'Variable name cannot be empty' }
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return {
        isValid: false,
        error:
          'Variable name can only contain letters, numbers, and underscores, and must start with a letter or underscore',
      }
    }

    return { isValid: true }
  }, [])

  // Importar ambiente
  const importEnvironment = useCallback(
    (environment: Environment) => {
      const newEnvironment = {
        ...environment,
        id: crypto.randomUUID(), // Novo ID para evitar conflitos
        isGlobal: false, // Nunca importar como global
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setEnvironments(prev => [...prev, newEnvironment])
    },
    [setEnvironments],
  )

  // Exportar ambiente
  const exportEnvironment = useCallback(
    (id: string): Environment | null => {
      return environments.find(env => env.id === id) || null
    },
    [environments],
  )

  // Exportar todos os ambientes
  const exportAllEnvironments = useCallback((): Environment[] => {
    return environments.filter(env => !env.isGlobal) // Não exportar ambiente global
  }, [environments])

  return {
    environments,
    activeEnvironmentId,
    globalEnvironment,
    activeEnvironment,

    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnvironment: setActiveEnvironmentId,
    duplicateEnvironment,

    addVariable,
    updateVariable,
    deleteVariable,

    resolveVariables,
    getVariableValue,
    getAllAvailableVariables,

    importEnvironment,
    exportEnvironment,
    exportAllEnvironments,

    hasVariables,
    validateVariableName,
  }
}
