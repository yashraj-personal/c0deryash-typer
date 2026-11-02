export type Aspect = '9:16' | '4:5' | '1:1' | '16:9'

export const ASPECTS: Record<Aspect, { w: number; h: number; label: string }> = {
  '9:16': { w: 1080, h: 1920, label: 'Reels / TikTok' },
  '4:5': { w: 1080, h: 1350, label: 'Instagram post' },
  '1:1': { w: 1080, h: 1080, label: 'Square' },
  '16:9': { w: 1920, h: 1080, label: 'YouTube' },
}

type Decor = 'none' | 'ruled' | 'grid' | 'scan'

export type Look = {
  id: string
  name: string
  bg: string
  ink: string
  filler: string
  rgb: string
  decor: Decor
}

export const LOOKS: Look[] = [
  { id: 'paper', name: 'Paper', bg: '#fbfaf7', ink: '#111111', filler: 'rgba(17,17,17,0.5)', rgb: '251,250,247', decor: 'none' },
  { id: 'news', name: 'Newsprint', bg: '#eee5d0', ink: '#1e1a12', filler: 'rgba(30,26,18,0.5)', rgb: '238,229,208', decor: 'none' },
  { id: 'night', name: 'Night', bg: '#131313', ink: '#f3f0ea', filler: 'rgba(243,240,234,0.42)', rgb: '19,19,19', decor: 'none' },
  { id: 'memo', name: 'Memo', bg: '#e8eef7', ink: '#0f1b33', filler: 'rgba(15,27,51,0.48)', rgb: '232,238,247', decor: 'ruled' },
  { id: 'terminal', name: 'Terminal', bg: '#07140b', ink: '#b6f5c0', filler: 'rgba(182,245,192,0.4)', rgb: '7,20,11', decor: 'scan' },
  { id: 'blueprint', name: 'Blueprint', bg: '#143a7a', ink: '#eef3ff', filler: 'rgba(238,243,255,0.45)', rgb: '20,58,122', decor: 'grid' },
  { id: 'blush', name: 'Blush', bg: '#f7dfe4', ink: '#3a1420', filler: 'rgba(58,20,32,0.45)', rgb: '247,223,228', decor: 'none' },
  { id: 'kraft', name: 'Kraft', bg: '#cfae84', ink: '#2b1d0e', filler: 'rgba(43,29,14,0.5)', rgb: '207,174,132', decor: 'none' },
  { id: 'ocean', name: 'Ocean', bg: '#d8f1f2', ink: '#073b4c', filler: 'rgba(7,59,76,0.46)', rgb: '216,241,242', decor: 'grid' },
  { id: 'violet', name: 'Violet', bg: '#271a3d', ink: '#f8edff', filler: 'rgba(248,237,255,0.42)', rgb: '39,26,61', decor: 'scan' },
  { id: 'citrus', name: 'Citrus', bg: '#f4edb8', ink: '#29320d', filler: 'rgba(41,50,13,0.48)', rgb: '244,237,184', decor: 'ruled' },
  { id: 'coral', name: 'Coral', bg: '#f7c5b8', ink: '#3b1714', filler: 'rgba(59,23,20,0.45)', rgb: '247,197,184', decor: 'none' },
]

export type LookMode = 'mixed' | string

export const HIGHLIGHTS = ['#ffe14d', '#ff9ec4', '#a6f05a', '#8fd3ff', '#ff7a45', '#c7a6ff', '#62e6d7', '#ffcf70', '#f486ff', '#ffffff']

export type FontMode = 'mixed' | 'serif' | 'sans' | 'mono' | 'script' | 'display'
export const FONT_MODES: { value: FontMode; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' },
  { value: 'mono', label: 'Mono' },
  { value: 'script', label: 'Script' },
  { value: 'display', label: 'Display' },
]

export type HighlightStyle = 'marker' | 'underline' | 'box' | 'circle' | 'invert' | 'glow'
export const HIGHLIGHT_STYLES: { value: HighlightStyle; label: string }[] = [
  { value: 'marker', label: 'Marker' },
  { value: 'underline', label: 'Underline' },
  { value: 'box', label: 'Box' },
  { value: 'circle', label: 'Circle' },
  { value: 'invert', label: 'Invert' },
  { value: 'glow', label: 'Glow' },
]

export type Motion = 'cut' | 'flash' | 'pulse' | 'shake' | 'spin' | 'scroll'
export const MOTIONS: { value: Motion; label: string }[] = [
  { value: 'cut', label: 'Hard cut' },
  { value: 'flash', label: 'Flash' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'shake', label: 'Shake' },
  { value: 'spin', label: 'Spin' },
  { value: 'scroll', label: 'Scroll' },
]

export type CaseMode = 'asis' | 'upper' | 'lower'
export const CASES: { value: CaseMode; label: string }[] = [
  { value: 'asis', label: 'As typed' },
  { value: 'upper', label: 'UPPER' },
  { value: 'lower', label: 'lower' },
]

export type MatchCutOptions = {
  phrase: string
  highlight: number
  lookMode: LookMode
  highlightColor: string
  fontMode: FontMode
  highlightStyle: HighlightStyle
  motion: Motion
  caseMode: CaseMode
  blur: boolean
  zoom: boolean
  grain: boolean
  typeOn: boolean
  seed: number
}

export type Frame = {
  cut: number
  cutProgress: number
  progress: number
  typed: number | null
  key: string
}

type FontCat = Exclude<FontMode, 'mixed'>
type CanvasFont = { family: string; weight: string; style: 'normal' | 'italic'; cat: FontCat; scale: number }

let cachedFonts: CanvasFont[] | null = null

function cssVar(name: string) {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function getFonts(): CanvasFont[] {
  if (cachedFonts) return cachedFonts
  const v = (name: string, fallback: string) => {
    const value = cssVar(name)
    return value ? `${value}, ${fallback}` : fallback
  }
  const dm = v('--font-dm-serif', 'Georgia, serif')
  const playfair = v('--font-playfair', 'Georgia, serif')
  const caveat = v('--font-caveat', 'cursive')
  const bebas = v('--font-bebas', 'Impact, sans-serif')
  const mono = v('--font-space-mono', '"Courier New", monospace')
  const geist = v('--font-geist', '"Helvetica Neue", Arial, sans-serif')

  const fonts: CanvasFont[] = [
    { family: dm, weight: '400', style: 'normal', cat: 'serif', scale: 1 },
    { family: playfair, weight: '700', style: 'normal', cat: 'serif', scale: 0.95 },
    { family: playfair, weight: '400', style: 'italic', cat: 'serif', scale: 1 },
    { family: 'Georgia, serif', weight: '700', style: 'normal', cat: 'serif', scale: 0.95 },
    { family: '"Times New Roman", Times, serif', weight: '400', style: 'normal', cat: 'serif', scale: 1.05 },
    { family: geist, weight: '700', style: 'normal', cat: 'sans', scale: 0.92 },
    { family: geist, weight: '400', style: 'normal', cat: 'sans', scale: 0.95 },
    { family: '"Helvetica Neue", Helvetica, Arial, sans-serif', weight: '700', style: 'normal', cat: 'sans', scale: 0.92 },
    { family: '"Arial Black", Arial, sans-serif', weight: '900', style: 'normal', cat: 'sans', scale: 0.85 },
    { family: mono, weight: '700', style: 'normal', cat: 'mono', scale: 0.78 },
    { family: mono, weight: '400', style: 'normal', cat: 'mono', scale: 0.78 },
    { family: '"Courier New", Courier, monospace', weight: '700', style: 'normal', cat: 'mono', scale: 0.8 },
    { family: caveat, weight: '700', style: 'normal', cat: 'script', scale: 1.25 },
    { family: caveat, weight: '400', style: 'normal', cat: 'script', scale: 1.25 },
    { family: playfair, weight: '400', style: 'italic', cat: 'script', scale: 1 },
    { family: bebas, weight: '400', style: 'normal', cat: 'display', scale: 1.15 },
    { family: playfair, weight: '900', style: 'normal', cat: 'display', scale: 0.92 },
    { family: playfair, weight: '900', style: 'italic', cat: 'display', scale: 0.92 },
    { family: geist, weight: '900', style: 'normal', cat: 'display', scale: 0.88 },
  ]
  if (cssVar('--font-dm-serif')) cachedFonts = fonts
  return fonts
}

export async function loadCanvasFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  cachedFonts = null
  await Promise.allSettled(getFonts().map((f) => document.fonts.load(`${f.style} ${f.weight} 64px ${f.family}`)))
}

const CORPUS = `the report released on tuesday suggests that the quiet shift has been underway for years and few
people noticed until the numbers arrived in plain sight analysts say the change reflects a deeper pattern in how
we live work and remember the small moments that shape a city every stranger on the street carries a story as vivid
and complex as your own a feeling some writers have tried to name for decades in the archive a single handwritten
note described the evening light over the harbor and the sound of trains leaving late the committee will meet again
next month to review the findings and publish a full statement sources close to the project confirmed that the final
draft was edited several times before it reached the public what remains is a record of ordinary days told with
unusual care and a reminder that history is mostly made of people who never expected to be written about`
  .split(/\s+/)
  .filter(Boolean)

export function splitPhrase(phrase: string) {
  return phrase.trim().split(/\s+/).filter(Boolean)
}

const applyCase = (text: string, mode: CaseMode) =>
  mode === 'upper' ? text.toUpperCase() : mode === 'lower' ? text.toLowerCase() : text

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(rand: () => number, list: T[]) => list[Math.floor(rand() * list.length)]
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const easeOut = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3

export function introDuration(opts: MatchCutOptions, duration: number) {
  if (!opts.typeOn) return 0
  const len = splitPhrase(opts.phrase).join(' ').length
  return Math.min(0.3 + len * 0.05, 1.8, duration * 0.5)
}

export function frameAt(t: number, duration: number, cps: number, opts: MatchCutOptions): Frame {
  const progress = duration > 0 ? t / duration : 0
  const intro = introDuration(opts, duration)
  if (t < intro) {
    const len = splitPhrase(opts.phrase).join(' ').length
    const typed = Math.min(len, Math.floor((t / intro) * len * 1.2))
    return { cut: 0, cutProgress: 0, progress, typed, key: `t${typed}` }
  }
  const ct = (t - intro) * cps
  const cut = Math.floor(ct)
  return { cut, cutProgress: ct - cut, progress, typed: null, key: `c${cut}` }
}

let noiseCanvas: HTMLCanvasElement | null = null
function getNoise() {
  if (noiseCanvas || typeof document === 'undefined') return noiseCanvas
  const size = 192
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const nctx = c.getContext('2d')
  if (!nctx) return null
  const img = nctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() < 0.5 ? 0 : 255
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = Math.random() * 34
  }
  nctx.putImageData(img, 0, 0)
  noiseCanvas = c
  return c
}

function drawDecor(ctx: CanvasRenderingContext2D, look: Look, width: number, height: number) {
  const unit = Math.min(width, height)
  ctx.save()
  if (look.decor === 'ruled') {
    ctx.strokeStyle = 'rgba(15,27,51,0.09)'
    ctx.lineWidth = 2
    const gap = unit / 14
    for (let y = gap; y < height; y += gap) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(214,52,71,0.35)'
    ctx.beginPath()
    ctx.moveTo(width * 0.08, 0)
    ctx.lineTo(width * 0.08, height)
    ctx.stroke()
  } else if (look.decor === 'grid') {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    const gap = unit / 16
    for (let x = gap; x < width; x += gap) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = gap; y < height; y += gap) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }
  ctx.restore()
}

export function drawMatchCutFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: Frame,
  opts: MatchCutOptions,
) {
  const { cut, cutProgress: lp, progress, typed } = frame
  const rand = mulberry32((opts.seed ^ Math.imul(cut + 1, 2654435761)) >>> 0)
  const fonts = getFonts()
  const pool = opts.fontMode === 'mixed' ? fonts : fonts.filter((f) => f.cat === opts.fontMode)
  const look = opts.lookMode === 'mixed' ? pick(rand, LOOKS) : (LOOKS.find((l) => l.id === opts.lookMode) ?? LOOKS[0])
  const font = pick(rand, pool.length ? pool : fonts)
  const intro = typed !== null

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.filter = 'none'
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = look.bg
  ctx.fillRect(0, 0, width, height)
  drawDecor(ctx, look, width, height)

  const words = splitPhrase(applyCase(opts.phrase, opts.caseMode))
  if (words.length === 0) return

  const cx = width / 2
  const cy = height / 2
  const unit = Math.min(width, height)
  const tiltSeed = rand() - 0.5
  const spinSeed = rand() < 0.5 ? -1 : 1

  let scale = opts.zoom ? 1 + 0.14 * easeInOut(progress) : 1
  let rotation = opts.fontMode === 'mixed' ? tiltSeed * 0.035 : 0
  let dx = 0
  let dy = 0

  if (!intro) {
    if (opts.motion === 'pulse') scale *= 1 + 0.14 * (1 - easeOut(lp * 2.5))
    if (opts.motion === 'spin') rotation += spinSeed * 0.35 * (1 - easeOut(lp * 2.2))
    if (opts.motion === 'shake') {
      const amp = unit * 0.014 * (1 - lp * 0.7)
      dx = Math.sin(lp * 91 + cut * 13.1) * amp
      dy = Math.cos(lp * 77 + cut * 7.7) * amp
    }
  }

  ctx.translate(cx + dx, cy + dy)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)

  let fs = unit * 0.12 * font.scale * (0.92 + rand() * 0.16)
  const setFont = (size: number) => {
    ctx.font = `${font.style} ${font.weight} ${size}px ${font.family}`
  }
  const measure = (text: string) => ctx.measureText(text).width

  setFont(fs)
  const maxW = width * 0.84
  const rawW = measure(words.join(' '))
  if (rawW > maxW) {
    fs *= maxW / rawW
    setFont(fs)
  }

  const hi = Math.min(Math.max(opts.highlight, 0), words.length - 1)
  const before = hi > 0 ? `${words.slice(0, hi).join(' ')} ` : ''
  const word = words[hi]
  const after = hi < words.length - 1 ? ` ${words.slice(hi + 1).join(' ')}` : ''
  const beforeW = measure(before)
  const wordW = measure(word)
  const afterW = measure(after)
  const space = measure(' ')

  const x0 = cx - beforeW - wordW / 2
  const baseline = cy + fs * 0.34
  const lh = fs * 1.32
  const margin = -fs * 0.6 + rand() * width * 0.1
  const rightEdge = width + fs
  const corpus = CORPUS.map((w) => applyCase(w, opts.caseMode))

  let cursor = Math.floor(rand() * corpus.length)
  const takeWords = (targetW: number) => {
    const out: string[] = []
    let w = 0
    while (w < targetW) {
      const next = corpus[cursor++ % corpus.length]
      out.push(next)
      w += measure(next) + space
    }
    return out
  }

  const jitter = Array.from({ length: 8 }, () => (rand() - 0.5) * fs * 0.06)

  if (!intro) {
    ctx.save()
    ctx.textBaseline = 'alphabetic'
    if (opts.blur) ctx.filter = `blur(${Math.max(1.5, fs * 0.028).toFixed(1)}px)`
    ctx.fillStyle = look.filler
    const scrollOffset = opts.motion === 'scroll' ? -easeOut(lp) * lh : 0

    const kMin = -Math.ceil(baseline / lh) - 3
    const kMax = Math.ceil((height - baseline) / lh) + 3
    for (let k = kMin; k <= kMax; k++) {
      if (k === 0) continue
      const indent = rand() < 0.12 ? fs * 1.5 : 0
      const start = margin + indent
      ctx.textAlign = 'left'
      ctx.fillText(takeWords(rightEdge - start).join(' '), start, baseline + k * lh + scrollOffset)
    }

    const leftSpan = x0 - space - margin
    if (leftSpan > 0) {
      const leftWords: string[] = []
      let w = 0
      while (true) {
        const next = corpus[cursor % corpus.length]
        const nw = measure(next) + space
        if (w + nw > leftSpan + fs * 2) break
        leftWords.push(next)
        cursor++
        w += nw
        if (w > leftSpan) break
      }
      ctx.textAlign = 'right'
      ctx.fillText(leftWords.join(' '), x0 - space, baseline)
    }

    const afterStart = x0 + beforeW + wordW + afterW + space
    ctx.textAlign = 'left'
    ctx.fillText(takeWords(rightEdge - afterStart).join(' '), afterStart, baseline)
    ctx.restore()
  }

  const visible = typed ?? Number.POSITIVE_INFINITY
  const beforeVis = before.slice(0, visible)
  const wordVis = word.slice(0, Math.max(0, visible - before.length))
  const afterVis = after.slice(0, Math.max(0, visible - before.length - word.length))
  const wordVisW = measure(wordVis)
  const wordDone = wordVis.length === word.length

  const pad = fs * 0.12
  const hx = x0 + beforeW - pad
  const hy = baseline - fs * 0.8
  const hw = wordVisW + pad * 2
  const hh = fs * 1.02
  const hcx = x0 + beforeW + wordW / 2
  const hcy = hy + hh / 2
  let wordInk = look.ink

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  if (wordVis.length > 0) {
    ctx.save()
    switch (opts.highlightStyle) {
      case 'marker':
        ctx.fillStyle = opts.highlightColor
        ctx.beginPath()
        ctx.moveTo(hx + jitter[0], hy + jitter[1])
        ctx.lineTo(hx + hw + jitter[2], hy + jitter[3])
        ctx.lineTo(hx + hw + jitter[4], hy + hh + jitter[5])
        ctx.lineTo(hx + jitter[6], hy + hh + jitter[7])
        ctx.closePath()
        ctx.fill()
        wordInk = '#111111'
        break
      case 'underline':
        ctx.fillStyle = opts.highlightColor
        ctx.fillRect(hx, baseline + fs * 0.08, hw, fs * 0.13)
        break
      case 'box':
        ctx.strokeStyle = opts.highlightColor
        ctx.lineWidth = fs * 0.06
        ctx.strokeRect(hx - pad * 0.5, hy - pad * 0.3, hw + pad, hh + pad * 0.6)
        break
      case 'circle':
        if (wordDone) {
          ctx.strokeStyle = opts.highlightColor
          ctx.lineWidth = fs * 0.05
          ctx.lineCap = 'round'
          const sweep = intro ? Math.PI * 2 : Math.PI * 2 * Math.min(1, 0.4 + easeOut(lp * 2.5) * 0.65)
          for (let pass = 0; pass < 2; pass++) {
            ctx.beginPath()
            ctx.ellipse(
              hcx + pass * fs * 0.03,
              hcy + pass * fs * 0.02,
              wordW / 2 + fs * 0.32,
              hh / 2 + fs * 0.16,
              jitter[pass] * 0.08,
              -Math.PI * 0.6,
              -Math.PI * 0.6 + sweep,
            )
            ctx.stroke()
          }
        }
        break
      case 'invert':
        ctx.fillStyle = look.ink
        ctx.fillRect(hx, hy, hw, hh)
        wordInk = look.bg
        break
      case 'glow':
        wordInk = look.ink
        break
    }
    ctx.restore()
  }

  ctx.fillStyle = look.ink
  if (beforeVis) ctx.fillText(beforeVis, x0, baseline)
  if (afterVis) ctx.fillText(afterVis, x0 + beforeW + wordW, baseline)

  if (wordVis) {
    ctx.save()
    if (opts.highlightStyle === 'glow') {
      ctx.shadowColor = opts.highlightColor
      ctx.shadowBlur = fs * 0.45
      ctx.fillStyle = opts.highlightColor
      ctx.fillText(wordVis, x0 + beforeW, baseline)
      ctx.shadowBlur = fs * 0.15
    }
    ctx.fillStyle = wordInk
    ctx.fillText(wordVis, x0 + beforeW, baseline)
    ctx.restore()
  }

  if (intro) {
    const typedW =
      measure(beforeVis) + (beforeVis.length === before.length ? wordVisW : 0) + (wordDone ? measure(afterVis) : 0)
    ctx.fillStyle = look.ink
    ctx.fillRect(x0 + typedW + fs * 0.04, baseline - fs * 0.78, Math.max(3, fs * 0.05), fs * 0.95)
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)

  if (opts.blur && !intro) {
    const r = Math.max(width, height) * 0.62
    const g = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r)
    g.addColorStop(0, `rgba(${look.rgb},0)`)
    g.addColorStop(1, `rgba(${look.rgb},0.7)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)
  }

  if (look.decor === 'scan') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    for (let y = 0; y < height; y += 6) ctx.fillRect(0, y, width, 2)
  }

  if (!intro && opts.motion === 'flash' && lp < 0.3) {
    ctx.fillStyle = `rgba(255,255,255,${(0.85 * (1 - lp / 0.3)).toFixed(3)})`
    ctx.fillRect(0, 0, width, height)
  }

  if (opts.grain) {
    const noise = getNoise()
    if (noise) {
      const pattern = ctx.createPattern(noise, 'repeat')
      if (pattern) {
        ctx.save()
        ctx.translate(Math.random() * 192, Math.random() * 192)
        ctx.fillStyle = pattern
        ctx.fillRect(-192, -192, width + 384, height + 384)
        ctx.restore()
      }
    }
  }
}

export function pickRecorderMime() {
  if (typeof MediaRecorder === 'undefined') return null
  const candidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

export function playTick(audio: AudioContext, destinations: AudioNode[], soft = false) {
  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = soft ? 'square' : 'triangle'
  osc.frequency.setValueAtTime(soft ? 1400 : 2200, now)
  osc.frequency.exponentialRampToValueAtTime(soft ? 600 : 900, now + 0.035)
  gain.gain.setValueAtTime(soft ? 0.08 : 0.22, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
  osc.connect(gain)
  for (const d of destinations) gain.connect(d)
  osc.start(now)
  osc.stop(now + 0.06)
}
