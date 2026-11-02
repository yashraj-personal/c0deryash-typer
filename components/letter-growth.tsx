import type { CSSProperties } from 'react'
import { CANVAS, CENTER, petalPath, sparklePath, type Growth, type Paint, type Theme } from '@/lib/garden'

type LetterGrowthProps = {
  growth: Growth
  theme: Theme
  layer: 'back' | 'front'
  petals: boolean
}

export function LetterGrowth({ growth, theme, layer, petals }: LetterGrowthProps) {
  const isFront = layer === 'front'
  const vines = growth.vines.filter((v) => v.front === isFront)
  const leaves = growth.leaves.filter((l) => l.front === isFront)
  const flowers = growth.flowers.filter((fl) => fl.front === isFront)
  const berries = growth.berries.filter((b) => b.front === isFront)
  const paint = (key?: Paint) => (key ? theme[key] : 'none')

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      className="tg-growth"
      style={{ zIndex: isFront ? 2 : 0 }}
    >
      {isFront &&
        growth.burst.map((dot, i) => (
          <circle
            key={`b${i}`}
            cx={CENTER}
            cy={CENTER}
            r={dot.r}
            fill={i % 2 ? theme.flower : theme.vine}
            className="tg-burst"
            style={{ '--bx': `${dot.dx}px`, '--by': `${dot.dy}px` } as CSSProperties}
          />
        ))}

      {vines.map((vine, i) => (
        <path
          key={`v${i}`}
          d={vine.d}
          pathLength={1}
          fill="none"
          stroke={theme.vine}
          strokeWidth={vine.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="tg-vine"
          style={{ '--dur': `${vine.duration}s`, animationDelay: `${vine.delay}s` } as CSSProperties}
        />
      ))}

      {leaves.map((leaf, i) => {
        const s = leaf.size
        return (
          <g key={`l${i}`} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
            <g className="tg-sway" style={{ animationDelay: `${-leaf.sway}s` }}>
              <g className="tg-pop" style={{ animationDelay: `${leaf.delay}s` }}>
                <path d={`M0 0 Q${s * 0.45} ${-s * 0.42} ${s} 0 Q${s * 0.45} ${s * 0.42} 0 0Z`} fill={theme.vine} />
                <path
                  d={`M${s * 0.14} 0 Q${s * 0.5} ${-s * 0.05} ${s * 0.82} 0`}
                  fill="none"
                  stroke={theme.vineLight}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>
        )
      })}

      {berries.map((berry, i) => (
        <g key={`r${i}`} transform={`translate(${berry.x} ${berry.y})`}>
          <g className="tg-pop" style={{ animationDelay: `${berry.delay}s` }}>
            <circle r={berry.r} fill={theme.flower} />
            <circle cx={-berry.r * 0.35} cy={-berry.r * 0.35} r={berry.r * 0.3} fill={theme.flowerLight} />
          </g>
        </g>
      ))}

      {flowers.map((flower, i) => (
        <g
          key={`f${i}`}
          transform={`translate(${flower.x} ${flower.y}) rotate(${flower.rotate}) scale(${flower.scale})`}
        >
          <g className="tg-breathe" style={{ animationDelay: `${-flower.sway}s` }}>
            <g className="tg-pop tg-bloom" style={{ animationDelay: `${flower.delay}s` }}>
              {flower.parts.map((part, j) => (
                <path
                  key={j}
                  d={part.d}
                  transform={part.rotate ? `rotate(${part.rotate})` : undefined}
                  fill={paint(part.fill)}
                  stroke={paint(part.stroke)}
                  strokeWidth={part.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          </g>
        </g>
      ))}

      {isFront &&
        growth.sparkles.map((sp, i) => (
          <g key={`s${i}`} transform={`translate(${sp.x} ${sp.y})`}>
            <path
              d={sparklePath(sp.size)}
              fill={theme.center}
              className="tg-twinkle"
              style={{ animationDelay: `${sp.delay}s`, animationDuration: `${sp.duration}s` }}
            />
          </g>
        ))}

      {isFront &&
        petals &&
        growth.falling.map((p, i) => (
          <g key={`p${i}`} transform={`translate(${p.x} ${p.y})`}>
            <g
              className="tg-fall"
              style={
                {
                  '--drift': `${p.drift}px`,
                  '--spin': `${p.spin}deg`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                } as CSSProperties
              }
            >
              <path
                d={petalPath(p.size * 0.55, p.size * 1.6)}
                fill={p.kind === 'petal' ? theme.flower : theme.vine}
              />
            </g>
          </g>
        ))}
    </svg>
  )
}
