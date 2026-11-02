export type FlowerStyle = 'blob' | 'rose' | 'daisy' | 'blossom' | 'tulip'
export type StyleChoice = 'theme' | 'mix' | FlowerStyle
export type Density = 'light' | 'lush' | 'wild'

export const FLOWER_STYLES: FlowerStyle[] = ['blob', 'rose', 'daisy', 'blossom', 'tulip']

export const STYLE_OPTIONS: { value: StyleChoice; label: string }[] = [
  { value: 'theme', label: 'Auto' },
  { value: 'blob', label: 'Poppy' },
  { value: 'rose', label: 'Rose' },
  { value: 'daisy', label: 'Daisy' },
  { value: 'blossom', label: 'Sakura' },
  { value: 'tulip', label: 'Tulip' },
  { value: 'mix', label: 'Mix' },
]

export const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'lush', label: 'Lush' },
  { value: 'wild', label: 'Wild' },
]

export type GardenFont = {
  id: string
  label: string
  family: string
  weight: number
  italic?: boolean
  scale: number
}

export const GARDEN_FONTS: GardenFont[] = [
  { id: 'serif', label: 'Serif', family: 'var(--font-dm-serif), Georgia, serif', weight: 400, scale: 1 },
  { id: 'didone', label: 'Didone', family: 'var(--font-playfair), Georgia, serif', weight: 700, scale: 0.95 },
  { id: 'italic', label: 'Italic', family: 'var(--font-playfair), Georgia, serif', weight: 400, italic: true, scale: 1 },
  { id: 'hand', label: 'Hand', family: 'var(--font-caveat), cursive', weight: 700, scale: 1.2 },
  { id: 'poster', label: 'Poster', family: 'var(--font-bebas), Impact, sans-serif', weight: 400, scale: 1.1 },
  { id: 'mono', label: 'Mono', family: 'var(--font-space-mono), monospace', weight: 700, scale: 0.8 },
]

export type Theme = {
  id: string
  name: string
  bg: string
  ink: string
  flower: string
  flowerLight: string
  center: string
  vine: string
  vineLight: string
  style: FlowerStyle
}

export const THEMES: Theme[] = [
  { id: 'rose', name: 'Rose', bg: '#f3d4d9', ink: '#141414', flower: '#d11f2f', flowerLight: '#f6a9b0', center: '#7a0d18', vine: '#2236a8', vineLight: '#cdd5ff', style: 'blob' },
  { id: 'poppy', name: 'Poppy', bg: '#efebe4', ink: '#121212', flower: '#ef4a2a', flowerLight: '#ffd4bd', center: '#2a1410', vine: '#1a2a9e', vineLight: '#d6dcff', style: 'blob' },
  { id: 'honey', name: 'Honey', bg: '#f6e3a1', ink: '#121212', flower: '#d6232b', flowerLight: '#f8a3a3', center: '#6e0d12', vine: '#1f6a2c', vineLight: '#d3ebc8', style: 'rose' },
  { id: 'meadow', name: 'Meadow', bg: '#dfe9cf', ink: '#14210f', flower: '#fffdf4', flowerLight: '#d9cfa8', center: '#f0aa1c', vine: '#2f6b3a', vineLight: '#cfe6c4', style: 'daisy' },
  { id: 'sakura', name: 'Sakura', bg: '#fbecee', ink: '#2a1216', flower: '#f39bb8', flowerLight: '#ffe1ea', center: '#c2185b', vine: '#5a3a2e', vineLight: '#e8d3c8', style: 'blossom' },
  { id: 'lavender', name: 'Lavender', bg: '#e7e1f5', ink: '#1a1430', flower: '#7b4fd1', flowerLight: '#d9c9ff', center: '#f2c94c', vine: '#2d6b4f', vineLight: '#cbe8da', style: 'tulip' },
  { id: 'sunset', name: 'Sunset', bg: '#ffd9b8', ink: '#2a130a', flower: '#e8452c', flowerLight: '#ffc2a8', center: '#7a1d0d', vine: '#2a5a2c', vineLight: '#d5ecc9', style: 'tulip' },
  { id: 'night', name: 'Night', bg: '#151a33', ink: '#f3eee4', flower: '#f19ab0', flowerLight: '#ffe3ea', center: '#ffd36e', vine: '#7fcf8e', vineLight: '#1d3b24', style: 'rose' },
  { id: 'ocean', name: 'Ocean', bg: '#d8f1f2', ink: '#0b2830', flower: '#087f8c', flowerLight: '#a9e4e5', center: '#f6b73c', vine: '#15616d', vineLight: '#bfe4d5', style: 'daisy' },
  { id: 'citrus', name: 'Citrus', bg: '#f1f2c8', ink: '#24300c', flower: '#e8751a', flowerLight: '#ffd58a', center: '#8a3f0a', vine: '#3b7d2c', vineLight: '#d8eb9c', style: 'blossom' },
  { id: 'plum', name: 'Plum', bg: '#24142f', ink: '#fff0f7', flower: '#d978c9', flowerLight: '#f6c7eb', center: '#ffd166', vine: '#77c59a', vineLight: '#315844', style: 'tulip' },
]

export type Paint = 'flower' | 'flowerLight' | 'center' | 'vine' | 'vineLight'

type Pt = [number, number]

export type Part = { d: string; fill?: Paint; stroke?: Paint; width?: number; rotate?: number }

export type VineShape = { d: string; width: number; delay: number; duration: number; front: boolean }
export type LeafShape = { x: number; y: number; angle: number; size: number; delay: number; front: boolean; sway: number }
export type FlowerShape = {
  x: number
  y: number
  rotate: number
  scale: number
  parts: Part[]
  delay: number
  front: boolean
  sway: number
}
export type BerryShape = { x: number; y: number; r: number; delay: number; front: boolean }
export type SparkleShape = { x: number; y: number; size: number; delay: number; duration: number }
export type FallingShape = {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  drift: number
  spin: number
  kind: 'petal' | 'leaf'
}
export type BurstDot = { dx: number; dy: number; r: number }

export type Growth = {
  vines: VineShape[]
  leaves: LeafShape[]
  flowers: FlowerShape[]
  berries: BerryShape[]
  sparkles: SparkleShape[]
  falling: FallingShape[]
  burst: BurstDot[]
}

/** SVG canvas is 300x300 units, centered on the letter. 100 units = 1em. */
export const CANVAS = 300
export const CENTER = CANVAS / 2

const DENSITY: Record<Density, { vines: number; maxFlowers: number; flowerChance: number; leafKeep: number; fall: number; sparkles: number }> = {
  light: { vines: 0.7, maxFlowers: 1, flowerChance: 0.3, leafKeep: 0.6, fall: 0.15, sparkles: 1 },
  lush: { vines: 1, maxFlowers: 2, flowerChance: 0.45, leafKeep: 0.74, fall: 0.35, sparkles: 2 },
  wild: { vines: 1.5, maxFlowers: 3, flowerChance: 0.65, leafKeep: 0.86, fall: 0.6, sparkles: 3 },
}

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

const f = (n: number) => Math.round(n * 10) / 10

function smoothPath(pts: Pt[], closed = false) {
  const n = pts.length
  if (n < 2) return ''
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  const segments = closed ? n : n - 1
  for (let i = 0; i < segments; i++) {
    const p0 = get(i - 1)
    const p1 = get(i)
    const p2 = get(i + 1)
    const p3 = get(i + 2)
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`
  }
  return closed ? `${d}Z` : d
}

function blobPath(rand: () => number, cx: number, cy: number, r: number) {
  const count = 8 + Math.floor(rand() * 3)
  const pts: Pt[] = []
  const phase = rand() * Math.PI * 2
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const wobble = 0.82 + rand() * 0.3 + Math.sin(a * 3 + phase) * 0.08
    pts.push([cx + Math.cos(a) * r * wobble, cy + Math.sin(a) * r * wobble])
  }
  return smoothPath(pts, true)
}

const circle = (x: number, y: number, r: number) =>
  `M${f(x - r)} ${f(y)} a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`

export const petalPath = (w: number, l: number) =>
  `M0 0 Q${f(w)} ${f(-l * 0.5)} 0 ${f(-l)} Q${f(-w)} ${f(-l * 0.5)} 0 0Z`

export const sparklePath = (s: number) =>
  `M0 ${f(-s)} Q0 0 ${f(s)} 0 Q0 0 0 ${f(s)} Q0 0 ${f(-s)} 0 Q0 0 0 ${f(-s)}Z`

function flowerParts(rand: () => number, style: FlowerStyle): Part[] {
  const parts: Part[] = []

  if (style === 'rose') {
    parts.push({ d: blobPath(rand, 0, 0, 22), fill: 'flower' })
    if (rand() < 0.7) parts.push({ d: blobPath(rand, (rand() - 0.5) * 18, 14 + rand() * 6, 13), fill: 'flower' })
    const spiral: Pt[] = []
    const turns = 2 + rand() * 0.6
    const start = rand() * Math.PI * 2
    for (let i = 0; i <= 22; i++) {
      const t = i / 22
      const a = start + t * turns * Math.PI * 2
      const r = 2 + t * 15
      spiral.push([Math.cos(a) * r, Math.sin(a) * r * 0.78])
    }
    parts.push({ d: smoothPath(spiral), stroke: 'flowerLight', width: 1.4 })
    return parts
  }

  if (style === 'daisy') {
    const n = 9 + Math.floor(rand() * 5)
    const l = 20 + rand() * 6
    const w = 5.5 + rand() * 1.5
    for (let i = 0; i < n; i++) {
      const lw = l * (0.9 + rand() * 0.2)
      parts.push({ d: petalPath(w, lw), fill: 'flower', stroke: 'flowerLight', width: 0.9, rotate: (i / n) * 360 })
    }
    parts.push({ d: circle(0, 0, 7.5), fill: 'center' })
    parts.push({ d: circle(-2, -2, 2.4), fill: 'flowerLight' })
    return parts
  }

  if (style === 'blossom') {
    const l = 17 + rand() * 4
    const w = 11 + rand() * 2
    for (let i = 0; i < 5; i++) {
      const notch = `M0 0 C${f(-w)} ${f(-l * 0.3)} ${f(-w)} ${f(-l)} ${f(-w * 0.25)} ${f(-l)} L0 ${f(-l * 0.84)} L${f(w * 0.25)} ${f(-l)} C${f(w)} ${f(-l)} ${f(w)} ${f(-l * 0.3)} 0 0Z`
      parts.push({ d: notch, fill: 'flower', rotate: i * 72 })
    }
    for (let i = 0; i < 5; i++) {
      const a = ((i * 72 + 36) * Math.PI) / 180
      const ex = Math.sin(a) * 9
      const ey = -Math.cos(a) * 9
      parts.push({ d: `M0 0 L${f(ex)} ${f(ey)}`, stroke: 'center', width: 1 })
      parts.push({ d: circle(ex, ey, 1.6), fill: 'center' })
    }
    parts.push({ d: circle(0, 0, 3.6), fill: 'flowerLight' })
    return parts
  }

  if (style === 'tulip') {
    const w = 13 + rand() * 4
    const h = 26 + rand() * 6
    parts.push({
      d: `M${f(-w)} 0 C${f(-w)} ${f(-h * 0.7)} ${f(-w * 0.5)} ${f(-h)} ${f(-w * 0.35)} ${f(-h * 1.05)} L0 ${f(-h * 0.7)} L${f(w * 0.35)} ${f(-h * 1.05)} C${f(w * 0.5)} ${f(-h)} ${f(w)} ${f(-h * 0.7)} ${f(w)} 0 C${f(w)} ${f(h * 0.45)} ${f(-w)} ${f(h * 0.45)} ${f(-w)} 0Z`,
      fill: 'flower',
    })
    parts.push({
      d: `M${f(-w * 0.45)} ${f(h * 0.12)} C${f(-w * 0.5)} ${f(-h * 0.4)} ${f(-w * 0.1)} ${f(-h * 0.75)} 0 ${f(-h * 0.7)} C${f(w * 0.1)} ${f(-h * 0.75)} ${f(w * 0.5)} ${f(-h * 0.4)} ${f(w * 0.45)} ${f(h * 0.12)}`,
      stroke: 'flowerLight',
      width: 1.3,
    })
    return parts
  }

  const count = 2 + Math.floor(rand() * 3)
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2
    const dist = i === 0 ? 0 : 12 + rand() * 10
    const bx = Math.cos(a) * dist
    const by = Math.sin(a) * dist
    const r = 13 + rand() * 9
    parts.push({ d: blobPath(rand, bx, by, r), fill: 'flower' })
    if (rand() < 0.75) {
      const w = r * (0.6 + rand() * 0.4)
      const lift = r * (0.3 + rand() * 0.3)
      parts.push({
        d: `M${f(bx - w)} ${f(by + lift * 0.4)} Q${f(bx - w * 0.3)} ${f(by - lift)} ${f(bx)} ${f(by)} Q${f(bx + w * 0.4)} ${f(by - lift * 0.8)} ${f(bx + w * 0.9)} ${f(by + lift * 0.3)}`,
        stroke: 'flowerLight',
        width: 1.4,
      })
    }
  }
  return parts
}

function makeFlower(rand: () => number, x: number, y: number, style: FlowerStyle, delay: number, front: boolean): FlowerShape {
  const upright = style === 'tulip'
  return {
    x,
    y,
    rotate: upright ? (rand() - 0.5) * 50 : rand() * 360,
    scale: (style === 'daisy' || style === 'blossom' ? 0.75 : 0.8) + rand() * 0.55,
    parts: flowerParts(rand, style),
    delay,
    front,
    sway: rand() * 4,
  }
}

export function generateGrowth(seed: number, choice: FlowerStyle | 'mix', density: Density = 'lush'): Growth {
  const rand = mulberry32(seed)
  const cfg = DENSITY[density]
  const pickStyle = () => (choice === 'mix' ? FLOWER_STYLES[Math.floor(rand() * FLOWER_STYLES.length)] : choice)

  const growth: Growth = { vines: [], leaves: [], flowers: [], berries: [], sparkles: [], falling: [], burst: [] }
  const { vines, leaves, flowers, berries } = growth

  const vineCount = Math.max(1, 1 + Math.floor(rand() * 2.6 * cfg.vines))

  for (let v = 0; v < vineCount; v++) {
    const start: Pt = [CENTER + (rand() - 0.5) * 40, CENTER + (rand() - 0.5) * 60]
    const downward = rand() < 0.28
    let angle = downward ? Math.PI / 2 + (rand() - 0.5) * 1.6 : -Math.PI / 2 + (rand() - 0.5) * 2.4
    let [x, y] = start
    const pts: Pt[] = [start]
    const steps = 6 + Math.floor(rand() * 7)
    let curvature = (0.03 + rand() * 0.12) * (rand() < 0.5 ? -1 : 1)

    for (let i = 0; i < steps; i++) {
      const len = 11 + rand() * 8
      angle += curvature + (rand() - 0.5) * 0.45
      x += Math.cos(angle) * len
      y += Math.sin(angle) * len
      pts.push([x, y])
      if (rand() < 0.15) curvature *= -1
    }
    const stemEnd = pts.length - 1

    if (rand() < 0.8) {
      const dir = Math.sign(curvature) || 1
      let len = 9 + rand() * 4
      const curlSteps = 7 + Math.floor(rand() * 5)
      for (let i = 0; i < curlSteps; i++) {
        angle += dir * (0.55 + i * 0.04)
        len *= 0.84
        x += Math.cos(angle) * len
        y += Math.sin(angle) * len
        pts.push([x, y])
      }
    }

    const delay = v * 0.14 + rand() * 0.1
    const duration = 1 + rand() * 0.8
    const front = rand() < 0.55
    vines.push({ d: smoothPath(pts), width: 2.2 + rand() * 1.3, delay, duration, front })

    let side = rand() < 0.5 ? 1 : -1
    for (let i = 2; i < stemEnd; i += 1 + Math.floor(rand() * 2)) {
      if (rand() > cfg.leafKeep) continue
      const prev = pts[i - 1]
      const next = pts[i + 1]
      const tangent = Math.atan2(next[1] - prev[1], next[0] - prev[0])
      const leafAngle = tangent + side * (0.55 + rand() * 0.6)
      side *= -1
      leaves.push({
        x: pts[i][0],
        y: pts[i][1],
        angle: (leafAngle * 180) / Math.PI,
        size: 13 + rand() * 11,
        delay: delay + duration * (i / pts.length) * 0.9,
        front: rand() < 0.6 ? front : !front,
        sway: rand() * 4,
      })
    }

    const [tx, ty] = pts[stemEnd]
    if (flowers.length < cfg.maxFlowers && rand() < cfg.flowerChance) {
      flowers.push(makeFlower(rand, tx, ty, pickStyle(), delay + duration * 0.75, rand() < 0.65))
    } else if (rand() < 0.45) {
      const count = 2 + Math.floor(rand() * 2)
      for (let b = 0; b < count; b++) {
        berries.push({
          x: tx + (rand() - 0.5) * 12,
          y: ty + (rand() - 0.5) * 12,
          r: 3 + rand() * 1.8,
          delay: delay + duration * 0.8 + b * 0.08,
          front,
        })
      }
    }
  }

  if (flowers.length < cfg.maxFlowers && rand() < cfg.flowerChance * 0.85) {
    const fx = CENTER + (rand() - 0.5) * 90
    const fy = CENTER - 30 + (rand() - 0.5) * 110
    flowers.push(makeFlower(rand, fx, fy, pickStyle(), 0.35 + rand() * 0.5, rand() < 0.7))
  }

  const sparkleCount = Math.floor(rand() * (cfg.sparkles + 1))
  for (let i = 0; i < sparkleCount; i++) {
    const a = rand() * Math.PI * 2
    const r = 50 + rand() * 60
    growth.sparkles.push({
      x: CENTER + Math.cos(a) * r,
      y: CENTER + Math.sin(a) * r * 0.8,
      size: 4 + rand() * 4,
      delay: 0.8 + rand() * 3,
      duration: 2 + rand() * 2.5,
    })
  }

  if (rand() < cfg.fall) {
    const source = flowers[0]
    growth.falling.push({
      x: source ? source.x : CENTER + (rand() - 0.5) * 80,
      y: source ? source.y : CENTER - 40,
      size: 7 + rand() * 4,
      delay: 1.5 + rand() * 4,
      duration: 6 + rand() * 5,
      drift: (rand() - 0.5) * 90,
      spin: (rand() - 0.5) * 540,
      kind: source ? 'petal' : 'leaf',
    })
  }

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.5
    const dist = 38 + rand() * 32
    growth.burst.push({ dx: Math.cos(a) * dist, dy: Math.sin(a) * dist, r: 1.6 + rand() * 1.6 })
  }

  return growth
}

export function resolveStyle(choice: StyleChoice, theme: Theme): FlowerStyle | 'mix' {
  return choice === 'theme' ? theme.style : choice
}
