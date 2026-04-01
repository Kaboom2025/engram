import type { ScoreBreakdown as ScoreBreakdownType } from '../types'

interface ScoreBreakdownProps {
  scores: ScoreBreakdownType
  weights: ScoreBreakdownType
  label?: string
}

const BARS = [
  { key: 'vector' as const, label: 'Vector', color: '#6366f1' },
  { key: 'graph' as const, label: 'Graph', color: '#4ade80' },
  { key: 'temporal' as const, label: 'Temporal', color: '#fb923c' },
]

export function ScoreBreakdown({ scores, weights, label }: ScoreBreakdownProps) {
  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</div>}
      {BARS.map(({ key, label: barLabel, color }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-16 text-right">{barLabel}</span>
          <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(scores[key] * 100, 2)}%`,
                background: color,
                opacity: 0.8,
              }}
            />
          </div>
          <span className="text-xs text-gray-500 w-16 tabular-nums">
            w={weights[key].toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}
