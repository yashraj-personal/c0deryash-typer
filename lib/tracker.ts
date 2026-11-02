/**
 * Privacy-friendly usage tracker for type garden.
 *
 * Sends small batches of events to a Google Apps Script web app, which
 * writes them into your Google Sheet.
 *
 * What is collected: a random anonymous visitor ID, a per-tab session ID,
 * pages/features used, browser / OS / device type, screen size, language,
 * timezone, referring site, and active time.
 *
 * What is NEVER collected: the text people type, exported videos, IP
 * addresses, names, emails or any account data.
 *
 * Tracking is skipped automatically when:
 *  - NEXT_PUBLIC_TRACKER_URL / NEXT_PUBLIC_TRACKER_KEY are not set
 *    (so local development does not pollute your sheet),
 *  - the browser sends Do-Not-Track or Global Privacy Control,
 *  - the visitor opted out with setTrackingOptOut(true).
 */

const ENDPOINT = process.env.NEXT_PUBLIC_TRACKER_URL || ''
const SITE_KEY = process.env.NEXT_PUBLIC_TRACKER_KEY || ''

const RESPECT_DO_NOT_TRACK = true
const FLUSH_INTERVAL_MS = 5000
const MAX_BATCH = 40
const MAX_QUEUE = 300
const MAX_ERRORS_PER_SESSION = 5

const UID_KEY = 'tg_uid'
const SID_KEY = 'tg_sid'
const OPT_OUT_KEY = 'tg_optout'

export type TrackProps = {
  /** Short text shown in the "Label" column (theme name, mode, format...). */
  label?: string
  /** Number shown in the "Value" column (seconds, MB, letter count...). */
  value?: number
  /** Any other key/value pairs end up as JSON in the "Details" column. */
  [extra: string]: string | number | boolean | null | undefined
}

type QueuedEvent = { e: string; t: number; p: string; l?: string; v?: number; d?: string }

type Context = {
  browser: string
  os: string
  device: string
  screen: string
  lang: string
  tz: string
  referrer: string
  utm: string
}

let started = false
let enabled = false
let uid = ''
let sid = ''
let ctx: Context | null = null
let queue: QueuedEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let visibleSince = 0
let errorCount = 0

/* ------------------------------ storage ------------------------------ */

function store(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function read(kind: 'local' | 'session', key: string): string | null {
  try {
    return store(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

function write(kind: 'local' | 'session', key: string, value: string) {
  try {
    store(kind)?.setItem(key, value)
  } catch {
    /* private mode / storage full — ignore */
  }
}

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

/* ------------------------------ consent ------------------------------ */

function trackingAllowed(): boolean {
  if (read('local', OPT_OUT_KEY) === '1') return false
  if (!RESPECT_DO_NOT_TRACK) return true
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string }
  const win = window as unknown as { doNotTrack?: string }
  const dnt = nav.doNotTrack === '1' || win.doNotTrack === '1' || nav.msDoNotTrack === '1'
  return !dnt && !nav.globalPrivacyControl
}

/** Let a visitor opt out (true) or back in (false). Wire to a button if you ever want one. */
export function setTrackingOptOut(optOut: boolean) {
  write('local', OPT_OUT_KEY, optOut ? '1' : '0')
  if (optOut) {
    enabled = false
    queue = []
  }
}

/* ------------------------------ context ------------------------------ */

function detectBrowser(ua: string): string {
  if (/Instagram/i.test(ua)) return 'Instagram in-app'
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook in-app'
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet'
  if (/Firefox|FxiOS/i.test(ua)) return 'Firefox'
  if (/CriOS|Chrome/i.test(ua)) return 'Chrome'
  if (/Safari/i.test(ua)) return 'Safari'
  return 'Other'
}

function detectOS(ua: string): string {
  const touchMac = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1
  if (/Windows/i.test(ua)) return 'Windows'
  if (/iPhone|iPad|iPod/i.test(ua) || touchMac) return 'iOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS'
  if (/CrOS/i.test(ua)) return 'ChromeOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Other'
}

function detectDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'tablet'
  if (/Mobi|iPhone|Android.*Mobile/i.test(ua)) return 'mobile'
  if (/Android/i.test(ua)) return 'tablet'
  return 'desktop'
}

function referrerHost(): string {
  try {
    if (!document.referrer) return ''
    const host = new URL(document.referrer).hostname
    return host === window.location.hostname ? '' : host
  } catch {
    return ''
  }
}

function utmString(): string {
  try {
    const p = new URLSearchParams(window.location.search)
    return ['utm_source', 'utm_medium', 'utm_campaign']
      .map((k) => p.get(k) || '')
      .filter(Boolean)
      .join('/')
  } catch {
    return ''
  }
}

function buildContext(): Context {
  const ua = navigator.userAgent || ''
  let tz = ''
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    /* ignore */
  }
  return {
    browser: detectBrowser(ua),
    os: detectOS(ua),
    device: detectDevice(ua),
    screen: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
    lang: navigator.language || '',
    tz,
    referrer: referrerHost(),
    utm: utmString(),
  }
}

/* ------------------------------ sending ------------------------------ */

function send(body: string, preferBeacon: boolean) {
  try {
    if (preferBeacon && typeof navigator.sendBeacon === 'function') {
      const queued = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
      if (queued) return
    }
    // text/plain + no-cors = a "simple" request, so no CORS preflight (Apps Script can't answer one).
    void fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
    }).catch(() => {})
  } catch {
    /* never let analytics break the app */
  }
}

function flush(preferBeacon = false) {
  if (!enabled || !ctx) return
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  while (queue.length) {
    const events = queue.splice(0, MAX_BATCH)
    send(JSON.stringify({ key: SITE_KEY, uid, sid, ctx, events }), preferBeacon)
  }
}

function schedule() {
  if (queue.length >= MAX_BATCH) return flush(false)
  if (!timer) {
    timer = setTimeout(() => {
      timer = null
      flush(false)
    }, FLUSH_INTERVAL_MS)
  }
}

/* ------------------------------ public API ------------------------------ */

function addActiveTime() {
  if (!visibleSince) return
  const seconds = Math.round((Date.now() - visibleSince) / 1000)
  visibleSince = 0
  if (seconds >= 1) track('active_seconds', { value: Math.min(seconds, 3600) })
}

export function initTracker() {
  if (started || typeof window === 'undefined') return
  started = true
  if (!ENDPOINT || !SITE_KEY || !trackingAllowed()) return
  enabled = true

  const knownVisitor = read('local', UID_KEY)
  uid = knownVisitor || randomId()
  if (!knownVisitor) write('local', UID_KEY, uid)

  const existingSession = read('session', SID_KEY)
  sid = existingSession || randomId()
  ctx = buildContext()
  visibleSince = document.visibilityState === 'visible' ? Date.now() : 0

  if (!existingSession) {
    write('session', SID_KEY, sid)
    track('session_start', { label: ctx.referrer || 'direct', returning: Boolean(knownVisitor) })
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      addActiveTime()
      flush(true)
    } else {
      visibleSince = Date.now()
    }
  })
  window.addEventListener('pagehide', () => {
    addActiveTime()
    flush(true)
  })
  window.addEventListener('pageshow', () => {
    if (document.visibilityState === 'visible') visibleSince = Date.now()
  })

  // Outbound link clicks (Instagram, etc.)
  document.addEventListener(
    'click',
    (ev) => {
      try {
        const a = (ev.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
        if (!a) return
        const url = new URL(a.href, window.location.href)
        if (url.protocol.startsWith('http') && url.origin !== window.location.origin) {
          track('outbound_click', { label: url.hostname })
        }
      } catch {
        /* ignore */
      }
    },
    true,
  )

  // A few JS errors per session help you spot browsers where the site breaks.
  window.addEventListener('error', (ev) => {
    if (errorCount >= MAX_ERRORS_PER_SESSION) return
    errorCount++
    track('js_error', { label: String(ev.message || 'error').slice(0, 120) })
  })
}

export function track(event: string, props: TrackProps = {}) {
  if (typeof window === 'undefined') return
  if (!started) initTracker()
  if (!enabled) return

  const { label, value, ...rest } = props
  const extras: Record<string, string | number | boolean | null> = {}
  for (const [k, v] of Object.entries(rest)) if (v !== undefined) extras[k] = v

  const item: QueuedEvent = { e: event, t: Date.now(), p: window.location.pathname }
  if (label !== undefined) item.l = String(label)
  if (typeof value === 'number' && Number.isFinite(value)) item.v = value
  if (Object.keys(extras).length) item.d = JSON.stringify(extras).slice(0, 500)

  queue.push(item)
  if (queue.length > MAX_QUEUE) queue.shift()
  schedule()
}
