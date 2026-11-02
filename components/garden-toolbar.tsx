'use client'

import type { ReactNode } from 'react'

export function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  renderLabel,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  renderLabel?: (option: { value: T; label: string }) => ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-60">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`tg-chip rounded-full border px-3 py-1 text-xs transition-all ${active ? 'is-active' : ''}`}
            >
              {renderLabel ? renderLabel(o) : o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ChipToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`tg-chip flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${checked ? 'is-active' : ''}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${checked ? 'bg-current' : 'border border-current'}`} />
      {label}
    </button>
  )
}
