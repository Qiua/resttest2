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
// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private isDevelopment: boolean
  private logHistory: LogEntry[] = []
  private maxHistorySize = 100

  constructor() {
    this.isDevelopment = import.meta.env.DEV
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    }

    // Store in history (limited size)
    this.logHistory.push(entry)
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }

    return entry
  }

  private formatMessage(entry: LogEntry): string {
    const parts = [`[${entry.timestamp}] [${entry.level.toUpperCase()}]`, entry.message]

    if (entry.context) {
      parts.push(JSON.stringify(entry.context, null, 2))
    }

    return parts.join(' ')
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error'
    }
    return true
  }

  debug(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('debug', message, context)

    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage(entry), context)
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context)

    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage(entry), context)
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warn', message, context)

    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage(entry), context)
    }

    // TODO: Send to monitoring service in production
    // this.sendToMonitoring(entry)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', message, context, error)

    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage(entry), {
        error: error?.message,
        stack: error?.stack,
        context,
      })
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // this.sendToErrorTracking(entry)
  }

  /**
   * Get log history (useful for debugging or displaying in UI)
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory]
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = []
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2)
  }

  /**
   * Download logs as a file
   */
  downloadLogs(): void {
    const blob = new Blob([this.exportLogs()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rest-test-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports for direct usage
export const { debug, info, warn, error } = logger
