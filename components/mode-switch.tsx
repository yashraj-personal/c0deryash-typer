'use client'

export type Mode = 'garden' | 'matchcut'

const MODES: { value: Mode; label: string }[] = [
  { value: 'garden', label: 'Garden' },
  { value: 'matchcut', label: 'Match cut' },
]

export function ModeSwitch({
  mode,
  onChange,
  activeText,
}: {
  mode: Mode
  onChange: (mode: Mode) => void
  activeText: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Mode"
      className="flex items-center rounded-full border border-current/25 p-0.5 font-sans text-sm"
    >
      {MODES.map((m) => {
        const active = m.value === mode
        return (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.value)}
            className={`rounded-full px-3 py-1 transition-colors ${active ? 'bg-current' : 'opacity-70 hover:opacity-100'}`}
          >
            <span style={active ? { color: activeText } : undefined}>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
