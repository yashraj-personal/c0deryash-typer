import type { Theme } from '@/lib/garden'

const FLIGHTS = [
  { className: 'tg-flight-a', size: 'size-9', delay: '0s', duration: '22s' },
  { className: 'tg-flight-b', size: 'size-7', delay: '-9s', duration: '28s' },
  { className: 'tg-flight-a', size: 'size-6', delay: '-16s', duration: '34s' },
]

function Butterfly({ theme }: { theme: Theme }) {
  const wing = (
    <>
      <path d="M0 -1 C-6 -14 -20 -16 -18 -4 C-17 2 -8 3 0 0Z" fill={theme.flower} />
      <path d="M0 1 C-8 3 -15 10 -10 15 C-6 18 -2 10 0 2Z" fill={theme.flower} />
      <path d="M-4 -3 C-9 -9 -14 -9 -14 -5" fill="none" stroke={theme.flowerLight} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="-12" cy="9" r="1.6" fill={theme.flowerLight} />
    </>
  )
  return (
    <svg viewBox="-20 -20 40 40" className="h-full w-full overflow-visible">
      <g className="tg-wings">
        {wing}
        <g transform="scale(-1 1)">{wing}</g>
      </g>
      <ellipse rx="1.6" ry="8" fill={theme.ink} />
      <path d="M-0.5 -7 Q-3 -13 -5 -14 M0.5 -7 Q3 -13 5 -14" fill="none" stroke={theme.ink} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

export function Butterflies({ theme }: { theme: Theme }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
      {FLIGHTS.map((flight, i) => (
        <div
          key={i}
          className={`tg-butterfly absolute left-0 top-0 ${flight.className} ${flight.size}`}
          style={{ animationDelay: flight.delay, animationDuration: flight.duration }}
        >
          <Butterfly theme={theme} />
        </div>
      ))}
    </div>
  )
}
