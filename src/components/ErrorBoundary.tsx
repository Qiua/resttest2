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
// src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { FiAlertTriangle, FiRefreshCw, FiHome, FiCopy } from 'react-icons/fi'

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackUI?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging (in development)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })

    // TODO: Send error to logging service in production
    // logErrorToService(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleCopyError = (): void => {
    const errorDetails = `
Error: ${this.state.error?.message || 'Unknown error'}

Stack Trace:
${this.state.error?.stack || 'No stack trace available'}

Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack available'}
    `.trim()

    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('Detalhes do erro copiados para a área de transferência')
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallbackUI) {
        return this.props.fallbackUI
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
                <FiAlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">Oops! Algo deu errado</h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              A aplicação encontrou um erro inesperado. Não se preocupe, seus dados estão seguros. Você pode tentar
              recarregar a página ou voltar para a página inicial.
            </p>

            {/* Error Details (collapsed by default) */}
            <details className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                Detalhes do Erro (para desenvolvedores)
              </summary>
              <div className="mt-4 space-y-4">
                {/* Error Message */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mensagem:</h3>
                  <pre className="bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 p-3 rounded text-xs overflow-x-auto">
                    {this.state.error?.message || 'Unknown error'}
                  </pre>
                </div>

                {/* Stack Trace */}
                {this.state.error?.stack && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stack Trace:</h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {/* Component Stack */}
                {this.state.errorInfo?.componentStack && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Component Stack:</h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <FiRefreshCw className="w-5 h-5" />
                Tentar Novamente
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                <FiHome className="w-5 h-5" />
                Recarregar Página
              </button>

              <button
                onClick={this.handleCopyError}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                <FiCopy className="w-5 h-5" />
                Copiar Erro
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-6">
              Se o problema persistir, por favor reporte o erro usando os detalhes acima.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
