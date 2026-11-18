import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 2 : 1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

/** Dates as readers expect them (November 2, 2026). JSON-LD keeps the ISO value instead. */
export function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export function plural(value: number, singular: string, pluralForm = `${singular}s`) {
  return `${formatNumber(value)} ${value === 1 ? singular : pluralForm}`
}

export function truncateMiddle(value: string, max = 60) {
  if (value.length <= max) return value
  const half = Math.floor((max - 1) / 2)
  return `${value.slice(0, half)}…${value.slice(value.length - half)}`
}

export function percentage(part: number, total: number) {
  if (!total) return 0
  return Math.round((part / total) * 1000) / 10
}
