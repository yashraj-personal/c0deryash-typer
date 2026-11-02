'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Eraser, RefreshCw, SlidersHorizontal } from 'lucide-react'
import {
  DENSITY_OPTIONS,
  GARDEN_FONTS,
  STYLE_OPTIONS,
  THEMES,
  generateGrowth,
  resolveStyle,
  type Density,
  type FlowerStyle,
  type StyleChoice,
  type Theme,
} from '@/lib/garden'
import { LetterGrowth } from '@/components/letter-growth'
import { Butterflies } from '@/components/butterflies'
import { ChipGroup, ChipToggle } from '@/components/garden-toolbar'
import { Credit } from '@/components/credit'
import { track } from '@/lib/tracker'

type Letter = { id: number; char: string; seed: number }

const MAX_LENGTH = 40
const DEMO_WORD = 'enter your text'

let nextId = 1
const makeLetter = (char: string, seed = Math.floor(Math.random() * 2 ** 31)): Letter => ({
  id: nextId++,
  char,
  seed,
})

const initialLetters = (): Letter[] =>
  DEMO_WORD.split('').map((char, i) => ({ id: -(i + 1), char, seed: 7919 * (i + 3) }))

function GardenLetter({
  letter,
  theme,
  style,
  density,
  petals,
}: {
  letter: Letter
  theme: Theme
  style: FlowerStyle | 'mix'
  density: Density
  petals: boolean
}) {
  const growth = useMemo(() => generateGrowth(letter.seed, style, density), [letter.seed, style, density])
  return (
    <span className="tg-letter">
      <LetterGrowth growth={growth} theme={theme} layer="back" petals={petals} />
      <span className="tg-glyph">{letter.char}</span>
      <LetterGrowth growth={growth} theme={theme} layer="front" petals={petals} />
    </span>
  )
}

export function TypeGarden({
  themeIndex,
  onThemeChange: setThemeIndex,
  modeSwitch,
}: {
  themeIndex: number
  onThemeChange: (index: number) => void
  modeSwitch?: ReactNode
}) {
  const [letters, setLetters] = useState<Letter[]>(initialLetters)
  const [pristine, setPristine] = useState(true)
  const [focused, setFocused] = useState(false)
  const [styleChoice, setStyleChoice] = useState<StyleChoice>('theme')
  const [fontId, setFontId] = useState(GARDEN_FONTS[0].id)
  const [density, setDensity] = useState<Density>('lush')
  const [butterflies, setButterflies] = useState(true)
  const [petals, setPetals] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    track('mode_view', { label: 'garden' })
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [])

  const theme = THEMES[themeIndex]
  const font = GARDEN_FONTS.find((g) => g.id === fontId) ?? GARDEN_FONTS[0]
  const flowerStyle = resolveStyle(styleChoice, theme)
  const value = letters.map((l) => l.char).join('')
  const refocus = () => inputRef.current?.focus()

  // Logs only HOW MUCH was typed (after 2s of quiet) — never the text itself.
  const scheduleTypingEvent = (length: number) => {
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => track('garden_typed', { value: length }), 2000)
  }

  const handleChange = (next: string) => {
    const clean = next.replace(/[\r\n\t]/g, '').slice(0, MAX_LENGTH)
    scheduleTypingEvent(clean.length)

    if (pristine && clean.length > value.length && clean.startsWith(value)) {
      setPristine(false)
      setLetters(clean.slice(value.length).split('').map((c) => makeLetter(c)))
      return
    }
    setPristine(false)

    let prefix = 0
    while (prefix < clean.length && prefix < value.length && clean[prefix] === value[prefix]) prefix++
    setLetters([...letters.slice(0, prefix), ...clean.slice(prefix).split('').map((c) => makeLetter(c))])
  }

  const regrow = () => {
    track('garden_regrow')
    setLetters((prev) => prev.map((l) => makeLetter(l.char)))
    refocus()
  }

  const clear = () => {
    track('garden_clear')
    setPristine(false)
    setLetters([])
    refocus()
  }

  const words = useMemo(() => {
    const groups: Letter[][] = [[]]
    for (const letter of letters) {
      if (letter.char === ' ') groups.push([])
      else groups[groups.length - 1].push(letter)
    }
    return groups
  }, [letters])

  const longestWord = Math.max(5, ...words.map((w) => w.length))
  const vh = Math.max(10, 28 - letters.length * 0.45)
  const fontSize = `calc(${font.scale} * clamp(3rem, min(${(140 / longestWord).toFixed(2)}vw, ${vh.toFixed(1)}vh), 14rem))`

  return (
    <div
      className="tg-root relative flex min-h-dvh flex-col overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: theme.bg, color: theme.ink, '--tg-ink': theme.ink } as CSSProperties}
    >
      {butterflies && <Butterflies theme={theme} />}

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-2xl tracking-tight md:text-3xl">type garden</h1>
          {modeSwitch}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label="Garden theme" className="flex flex-wrap items-center gap-2">
            {THEMES.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={i === themeIndex}
                aria-label={`${t.name} theme`}
                title={t.name}
                onClick={() => {
                  setThemeIndex(i)
                  track('garden_theme', { label: t.name })
                  refocus()
                }}
                className="size-6 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: `linear-gradient(135deg, ${t.flower} 50%, ${t.vine} 50%)`,
                  borderColor: i === themeIndex ? theme.ink : 'transparent',
                  outlineColor: theme.ink,
                }}
              />
            ))}
          </div>
          <span className="mx-1 h-5 w-px opacity-30" style={{ backgroundColor: theme.ink }} aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              track('garden_panel', { label: panelOpen ? 'close' : 'open' })
              setPanelOpen((o) => !o)
            }}
            aria-expanded={panelOpen}
            aria-controls="garden-panel"
            aria-label="Toggle style options"
            className="rounded-full p-2 transition-opacity hover:opacity-60"
          >
            <SlidersHorizontal className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={regrow} aria-label="Regrow garden" className="rounded-full p-2 transition-opacity hover:opacity-60">
            <RefreshCw className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={clear} aria-label="Clear text" className="rounded-full p-2 transition-opacity hover:opacity-60">
            <Eraser className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <label htmlFor="garden-input" className="sr-only">
          Type a word to grow a garden
        </label>
        <input
          id="garden-input"
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={MAX_LENGTH}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none"
        />

        <div
          aria-hidden="true"
          className="tg-text pointer-events-none flex max-w-full flex-wrap items-center justify-center"
          style={{
            fontSize,
            fontFamily: font.family,
            fontWeight: font.weight,
            fontStyle: font.italic ? 'italic' : 'normal',
          }}
        >
          {words.map((word, wi) => (
            <span key={wi} className="inline-flex whitespace-nowrap">
              {word.map((letter) => (
                <GardenLetter
                  key={`${letter.id}-${flowerStyle}-${density}`}
                  letter={letter}
                  theme={theme}
                  style={flowerStyle}
                  density={density}
                  petals={petals}
                />
              ))}
              {wi < words.length - 1 && <span className="tg-space" />}
              {wi === words.length - 1 && <span className={`tg-caret ${focused ? 'is-active' : ''}`} />}
            </span>
          ))}
        </div>

        {letters.length === 0 && (
          <p className="pointer-events-none absolute font-serif text-4xl italic opacity-40 md:text-6xl">start typing…</p>
        )}
      </main>

      <footer className="relative z-20 flex flex-col items-center gap-4 px-5 pb-5 md:pb-6">
        {panelOpen && (
          <div
            id="garden-panel"
            className="tg-panel flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-3xl border px-5 py-3"
            style={{ '--tg-bg': theme.bg } as CSSProperties}
          >
            <ChipGroup
              label="Flowers"
              value={styleChoice}
              options={STYLE_OPTIONS}
              onChange={(v) => {
                setStyleChoice(v)
                track('garden_flowers', { label: v })
                refocus()
              }}
            />
            <ChipGroup
              label="Font"
              value={fontId}
              options={GARDEN_FONTS.map((g) => ({ value: g.id, label: g.label }))}
              onChange={(v) => {
                setFontId(v)
                track('garden_font', { label: v })
                refocus()
              }}
              renderLabel={(o) => {
                const g = GARDEN_FONTS.find((x) => x.id === o.value)
                return (
                  <span style={{ fontFamily: g?.family, fontWeight: g?.weight, fontStyle: g?.italic ? 'italic' : 'normal' }}>
                    {o.label}
                  </span>
                )
              }}
            />
            <ChipGroup
              label="Growth"
              value={density}
              options={DENSITY_OPTIONS}
              onChange={(v) => {
                setDensity(v)
                track('garden_density', { label: v })
                refocus()
              }}
            />
            <div className="flex gap-1.5">
              <ChipToggle
                label="Butterflies"
                checked={butterflies}
                onChange={(v) => {
                  setButterflies(v)
                  track('garden_toggle', { label: 'butterflies', value: v ? 1 : 0 })
                }}
              />
              <ChipToggle
                label="Falling petals"
                checked={petals}
                onChange={(v) => {
                  setPetals(v)
                  track('garden_toggle', { label: 'petals', value: v ? 1 : 0 })
                }}
              />
            </div>
          </div>
        )}
        <p className="text-center text-sm opacity-60">
          {pristine ? 'Type anything — watch it bloom.' : 'Backspace to prune. Regrow for a new garden.'}
        </p>
        <Credit className="opacity-80" />
      </footer>
    </div>
  )
}
