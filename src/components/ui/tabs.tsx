'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type TabItem = { value: string; label: string; hint?: string }

/**
 * ARIA tabs with arrow-key navigation. The active tab is mirrored into the URL
 * hash so /encoders-decoders/base64/#decode opens deep-linked on the decode tab.
 */
export function Tabs({
  items,
  value,
  onValueChange,
  className,
  idPrefix,
}: {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  idPrefix: string
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number) => {
    const item = items[index]
    if (!item) return
    onValueChange(item.value)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${item.value}`)
    refs.current[index]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Tool modes"
      className={cn('flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200', className)}
      onKeyDown={(event) => {
        const current = items.findIndex((i) => i.value === value)
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          select((current + 1) % items.length)
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          select((current - 1 + items.length) % items.length)
        }
        if (event.key === 'Home') {
          event.preventDefault()
          select(0)
        }
        if (event.key === 'End') {
          event.preventDefault()
          select(items.length - 1)
        }
      }}
    >
      {items.map((item, index) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.value}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => select(index)}
            className={cn(
              'relative rounded-lg px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
              active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900',
            )}
          >
            {item.label}
            {item.hint ? <span className="ml-1.5 text-xs font-medium text-slate-400">{item.hint}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  value,
  active,
  idPrefix,
  children,
}: {
  value: string
  active: boolean
  idPrefix: string
  children: React.ReactNode
}) {
  if (!active) return null
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      tabIndex={0}
      className="focus-visible:outline-none"
    >
      {children}
    </div>
  )
}

export function useHashTab(values: string[], fallback: string) {
  const [value, setValue] = React.useState(fallback)
  React.useEffect(() => {
    const fromHash = window.location.hash.replace('#', '')
    if (values.includes(fromHash)) setValue(fromHash)
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '')
      if (values.includes(next)) setValue(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [value, setValue] as const
}
