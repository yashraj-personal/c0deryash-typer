'use client'

import { useState } from 'react'
import { TypeGarden } from '@/components/type-garden'
import { MatchCut } from '@/components/match-cut'
import { ModeSwitch, type Mode } from '@/components/mode-switch'
import { THEMES } from '@/lib/garden'

export function Studio() {
  const [mode, setMode] = useState<Mode>('garden')
  const [themeIndex, setThemeIndex] = useState(0)

  if (mode === 'matchcut') {
    return <MatchCut modeSwitch={<ModeSwitch mode={mode} onChange={setMode} activeText="#0f0f0f" />} />
  }

  return (
    <TypeGarden
      themeIndex={themeIndex}
      onThemeChange={setThemeIndex}
      modeSwitch={<ModeSwitch mode={mode} onChange={setMode} activeText={THEMES[themeIndex].bg} />}
    />
  )
}
