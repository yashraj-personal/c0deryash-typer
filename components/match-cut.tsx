'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Download, Loader2, Pause, Play, Shuffle, Video, X } from 'lucide-react'
import {
  ASPECTS,
  CASES,
  FONT_MODES,
  HIGHLIGHTS,
  HIGHLIGHT_STYLES,
  LOOKS,
  MOTIONS,
  drawMatchCutFrame,
  frameAt,
  loadCanvasFonts,
  pickRecorderMime,
  playTick,
  splitPhrase,
  type Aspect,
  type CaseMode,
  type FontMode,
  type HighlightStyle,
  type LookMode,
  type MatchCutOptions,
  type Motion,
} from '@/lib/match-cut'
import { Field, RangeField, Segmented, Toggle } from '@/components/studio-controls'
import { Credit } from '@/components/credit'
import { track } from '@/lib/tracker'

const MAX_PHRASE = 40
const FPS = 30

const PRESETS = [
  { phrase: 'enter your text', highlight: 1 },
  { phrase: 'breaking: prestige is back', highlight: 1 },
  { phrase: 'chapter one. heaven.', highlight: 2 },
  { phrase: 'you were always the plot twist', highlight: 4 },
  { phrase: 'main character energy', highlight: 1 },
  { phrase: 'it was never about the money', highlight: 3 },
]

type Clock = { start: number; pausedAt: number; playing: boolean; recording: boolean }
type Result = { url: string; ext: string; size: number }

export function MatchCut({ modeSwitch }: { modeSwitch: ReactNode }) {
  const [phrase, setPhrase] = useState(PRESETS[0].phrase)
  const [highlight, setHighlight] = useState(PRESETS[0].highlight)
  const [aspect, setAspect] = useState<Aspect>('9:16')
  const [lookMode, setLookMode] = useState<LookMode>('mixed')
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHTS[0])
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>('marker')
  const [fontMode, setFontMode] = useState<FontMode>('mixed')
  const [motion, setMotion] = useState<Motion>('cut')
  const [caseMode, setCaseMode] = useState<CaseMode>('asis')
  const [cps, setCps] = useState(8)
  const [duration, setDuration] = useState(5)
  const [blur, setBlur] = useState(true)
  const [zoom, setZoom] = useState(true)
  const [grain, setGrain] = useState(false)
  const [typeOn, setTypeOn] = useState(true)
  const [sound, setSound] = useState(false)
  const [seed, setSeed] = useState(20261102)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState<number | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clockRef = useRef<Clock>({ start: 0, pausedAt: 0, playing: true, recording: false })
  const audioRef = useRef<AudioContext | null>(null)
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)

  const words = splitPhrase(phrase)
  const safeHighlight = Math.min(highlight, Math.max(0, words.length - 1))
  const recording = progress !== null
  const { w, h } = ASPECTS[aspect]

  const opts: MatchCutOptions = {
    phrase,
    highlight: safeHighlight,
    lookMode,
    highlightColor,
    highlightStyle,
    fontMode,
    motion,
    caseMode,
    blur,
    zoom,
    grain,
    typeOn,
    seed,
  }
  useEffect(() => {
    track('mode_view', { label: 'matchcut' })
  }, [])

  const settingsRef = useRef({ opts, cps, duration, sound })
  useEffect(() => {
    settingsRef.current = { opts, cps, duration, sound }
  })

  useEffect(() => {
    void loadCanvasFonts()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clockRef.current.playing = false
      setPlaying(false)
    }
    clockRef.current.start = performance.now()

    let raf = 0
    let lastDraw = 0
    let lastKey = ''
    let lastProgressUpdate = 0

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - lastDraw < 1000 / FPS - 1) return
      lastDraw = now

      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      const clock = clockRef.current
      const { opts, cps: cutsPerSecond, duration: dur, sound: withSound } = settingsRef.current
      const elapsed = clock.playing ? (now - clock.start) / 1000 : clock.pausedAt
      const t = clock.recording ? Math.min(elapsed, dur) : elapsed % dur
      const frame = frameAt(t, dur, cutsPerSecond, opts)

      drawMatchCutFrame(ctx, canvas.width, canvas.height, frame, opts)

      if (frame.key !== lastKey) {
        lastKey = frame.key
        const audio = audioRef.current
        if (withSound && clock.playing && audio?.state === 'running') {
          const dests: AudioNode[] = [audio.destination]
          if (clock.recording && audioDestRef.current) dests.push(audioDestRef.current)
          playTick(audio, dests, frame.typed !== null)
        }
      }

      if (clock.recording) {
        if (now - lastProgressUpdate > 100) {
          lastProgressUpdate = now
          setProgress(Math.min(1, t / dur))
        }
        if (elapsed >= dur + 1 / FPS) {
          clock.recording = false
          recorderRef.current?.stop()
        }
      }
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url)
    }
  }, [result])

  const ensureAudio = () => {
    if (!audioRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      audioRef.current = new Ctor()
    }
    if (audioRef.current.state === 'suspended') void audioRef.current.resume()
    return audioRef.current
  }

  const togglePlay = () => {
    const clock = clockRef.current
    const now = performance.now()
    if (clock.playing) {
      clock.pausedAt = (now - clock.start) / 1000
      clock.playing = false
      setPlaying(false)
    } else {
      clock.start = now - clock.pausedAt * 1000
      clock.playing = true
      setPlaying(true)
      if (sound) ensureAudio()
    }
  }

  const restart = () => {
    clockRef.current.start = performance.now()
    clockRef.current.pausedAt = 0
  }

  const toggleSound = (next: boolean) => {
    setSound(next)
    if (next) ensureAudio()
  }

  const surpriseMe = () => {
    track('matchcut_surprise')
    const r = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
    setFontMode(r(FONT_MODES).value)
    setHighlightStyle(r(HIGHLIGHT_STYLES).value)
    setMotion(r(MOTIONS).value)
    setHighlightColor(r(HIGHLIGHTS))
    setLookMode(Math.random() < 0.4 ? 'mixed' : r(LOOKS).id)
    setSeed(Math.floor(Math.random() * 2 ** 31))
    restart()
  }

  const startExport = () => {
    setError(null)
    const canvas = canvasRef.current
    const mime = pickRecorderMime()
    if (!canvas || mime === null || typeof canvas.captureStream !== 'function') {
      setError('Video export is not supported in this browser. Try the latest Chrome, Edge, Firefox or Safari.')
      track('video_export_error', { label: 'unsupported_browser' })
      return
    }

    const stream = canvas.captureStream(FPS)
    if (sound) {
      const audio = ensureAudio()
      if (audio) {
        audioDestRef.current = audio.createMediaStreamDestination()
        for (const track of audioDestRef.current.stream.getAudioTracks()) stream.addTrack(track)
      }
    }

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 12_000_000 } : undefined)
    } catch {
      setError('Could not start the recorder in this browser.')
      track('video_export_error', { label: 'recorder_failed' })
      return
    }

    const exportStartedAt = performance.now()
    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    recorder.onstop = () => {
      const type = recorder.mimeType || mime || 'video/webm'
      const blob = new Blob(chunks, { type })
      for (const track of stream.getTracks()) track.stop()
      audioDestRef.current = null
      recorderRef.current = null
      setProgress(null)
      const ext = type.includes('mp4') ? 'mp4' : 'webm'
      setResult({ url: URL.createObjectURL(blob), ext, size: blob.size })
      track('video_export_success', {
        label: ext,
        value: Math.round(blob.size / 10_000) / 100, // MB
        aspect,
        seconds: duration,
        render_ms: Math.round(performance.now() - exportStartedAt),
      })
    }

    recorderRef.current = recorder
    setResult(null)
    setProgress(0)
    setPlaying(true)
    const clock = clockRef.current
    clock.start = performance.now()
    clock.playing = true
    clock.recording = true
    track('video_export_start', {
      label: aspect,
      value: duration,
      look: lookMode,
      motion,
      font: fontMode,
      highlight: highlightStyle,
      case: caseMode,
      cps,
      words: words.length,
      sound,
      blur,
      zoom,
      grain,
      typewriter: typeOn,
    })
    recorder.start(250)
  }

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    track('matchcut_preset', { label: p.phrase })
    setPhrase(p.phrase)
    setHighlight(p.highlight)
    restart()
  }

  const fileName = `match-cut-${(words[safeHighlight] ?? 'video').toLowerCase().replace(/[^a-z0-9]+/g, '')}`

  return (
    <div className="flex min-h-dvh flex-col bg-[#0f0f0f] text-[#f2efe8]">
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-serif text-2xl tracking-tight md:text-3xl">
            match <span className="bg-[#ffe14d] px-1 text-[#0f0f0f]">cut</span>
          </h1>
          {modeSwitch}
        </div>
        <p className="hidden text-sm text-white/50 md:block">Type a phrase. Highlight a word. Export a video.</p>
      </header>

      <main className="grid flex-1 gap-6 px-5 pb-8 md:px-8 lg:grid-cols-[400px_1fr]">
        <section aria-label="Match cut settings" className="order-2 flex flex-col gap-6 lg:order-none">
          <Field label="Your phrase" htmlFor="mc-phrase">
            <input
              id="mc-phrase"
              value={phrase}
              maxLength={MAX_PHRASE}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Enter your text"
              autoComplete="off"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-serif text-xl outline-none transition-colors focus:border-[#ffe14d]"
            />
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.phrase}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
                >
                  {p.phrase}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Highlight a word">
            {words.length === 0 ? (
              <p className="text-sm text-white/40">Type a phrase first.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {words.map((word, i) => (
                  <button
                    key={`${word}-${i}`}
                    type="button"
                    aria-pressed={i === safeHighlight}
                    onClick={() => setHighlight(i)}
                    className={`rounded-md px-2.5 py-1 font-serif text-lg transition-colors ${
                      i === safeHighlight ? 'text-[#0f0f0f]' : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                    style={i === safeHighlight ? { backgroundColor: highlightColor } : undefined}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
            <div role="radiogroup" aria-label="Highlight color" className="flex flex-wrap gap-2 pt-1">
              {HIGHLIGHTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === highlightColor}
                  aria-label={`Highlight color ${c}`}
                  onClick={() => setHighlightColor(c)}
                  className="size-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: c === highlightColor ? '#f2efe8' : 'transparent' }}
                />
              ))}
            </div>
          </Field>

          <Field label="Highlight style">
            <Segmented label="Highlight style" value={highlightStyle} onChange={setHighlightStyle} options={HIGHLIGHT_STYLES} />
          </Field>

          <Field label="Writing style">
            <Segmented label="Writing style" value={fontMode} onChange={setFontMode} options={FONT_MODES} />
            <Segmented label="Letter case" value={caseMode} onChange={setCaseMode} options={CASES} />
          </Field>

          <Field label="Animation">
            <Segmented label="Animation" value={motion} onChange={setMotion} options={MOTIONS} />
          </Field>

          <Field label="Look">
            <Segmented
              label="Look"
              value={lookMode}
              onChange={setLookMode}
              options={[{ value: 'mixed', label: 'Mixed' }, ...LOOKS.map((l) => ({ value: l.id, label: l.name }))]}
            />
          </Field>

          <Field label="Format">
            <Segmented
              label="Aspect ratio"
              value={aspect}
              onChange={setAspect}
              options={(Object.keys(ASPECTS) as Aspect[]).map((a) => ({ value: a, label: a }))}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <RangeField id="mc-speed" label="Cuts per second" value={cps} min={2} max={15} step={1} suffix="/s" onChange={setCps} />
            <RangeField id="mc-duration" label="Duration" value={duration} min={2} max={12} step={1} suffix="s" onChange={setDuration} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Typewriter intro" checked={typeOn} onChange={setTypeOn} />
            <Toggle label="Depth blur" checked={blur} onChange={setBlur} />
            <Toggle label="Slow zoom" checked={zoom} onChange={setZoom} />
            <Toggle label="Film grain" checked={grain} onChange={setGrain} />
            <Toggle label="Tick sound" checked={sound} onChange={toggleSound} />
          </div>
        </section>

        <section aria-label="Preview" className="flex flex-col items-center gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="relative flex w-full items-center justify-center rounded-2xl bg-white/[0.03] p-4">
            <canvas
              ref={canvasRef}
              width={w}
              height={h}
              role="img"
              aria-label={`Match cut preview of “${phrase}” with “${words[safeHighlight] ?? ''}” highlighted`}
              className="h-auto max-h-[68vh] w-auto max-w-full rounded-lg shadow-2xl"
            />
            {recording && (
              <div className="absolute inset-x-6 bottom-6 flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-sm backdrop-blur">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Rendering video…</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full bg-[#ffe14d] transition-[width]" style={{ width: `${(progress ?? 0) * 100}%` }} />
                </div>
                <span className="font-mono text-xs">{Math.round((progress ?? 0) * 100)}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={recording}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => {
                track('matchcut_shuffle')
                setSeed(Math.floor(Math.random() * 2 ** 31))
              }}
              disabled={recording}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Shuffle className="size-4" aria-hidden="true" />
              Shuffle layouts
            </button>
            <button
              type="button"
              onClick={surpriseMe}
              disabled={recording}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              Surprise me
            </button>
            <button
              type="button"
              onClick={startExport}
              disabled={recording || words.length === 0}
              className="flex items-center gap-2 rounded-full bg-[#ffe14d] px-5 py-2 text-sm font-medium text-[#0f0f0f] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Video className="size-4" aria-hidden="true" />
              {recording ? 'Rendering…' : `Create ${duration}s video`}
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-[#ff9ec4]">
              {error}
            </p>
          )}

          {result && (
            <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Your video</h2>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  aria-label="Close video"
                  className="rounded-full p-1 text-white/60 hover:text-white"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <video src={result.url} controls loop playsInline className="max-h-[50vh] w-full rounded-lg bg-black" />
              <a
                href={result.url}
                download={`${fileName}.${result.ext}`}
                onClick={() => track('video_download', { label: result.ext, value: Math.round(result.size / 10_000) / 100 })}
                className="flex items-center justify-center gap-2 rounded-full bg-[#f2efe8] px-4 py-2 text-sm font-medium text-[#0f0f0f] transition-opacity hover:opacity-90"
              >
                <Download className="size-4" aria-hidden="true" />
                Download {result.ext.toUpperCase()} ({(result.size / 1_000_000).toFixed(1)} MB)
              </a>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-5">
        <Credit className="text-white/60" />
      </footer>
    </div>
  )
}
