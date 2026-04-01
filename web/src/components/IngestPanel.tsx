import { useEffect, useState } from 'react'
import { fetchScenarios, ingestScenario } from '../api'
import type { Scenario } from '../types'

interface IngestPanelProps {
  onIngested: () => void
}

const SCENARIO_LABELS: Record<string, string> = {
  tech_stack: 'Tech Stack Discussion',
  project_deps: 'Project Dependencies',
  meeting_notes: 'Team Meeting Notes',
}

export function IngestPanel({ onIngested }: IngestPanelProps) {
  const [scenarios, setScenarios] = useState<Record<string, Scenario>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    fetchScenarios().then(setScenarios).catch(() => {})
  }, [])

  async function handleIngest(name: string) {
    setLoading(name)
    setResult(null)
    try {
      const data = await ingestScenario(name)
      const created = (data as Record<string, number>).entities_created ?? 0
      const rels = (data as Record<string, number>).relationships_created ?? 0
      setResult(`Added ${created} entities, ${rels} relationships`)
      onIngested()
    } catch {
      setResult('Ingest failed')
    } finally {
      setLoading(null)
    }
  }

  const keys = Object.keys(scenarios)
  if (keys.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {keys.map((name) => (
          <button
            key={name}
            onClick={() => handleIngest(name)}
            disabled={loading !== null}
            className="px-4 py-2 rounded-xl bg-surface-3 border border-border text-sm text-gray-300 hover:text-white hover:border-green/50 transition-colors disabled:opacity-40"
          >
            {loading === name ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin mr-2" />
            ) : null}
            {SCENARIO_LABELS[name] ?? name}
            <span className="ml-2 text-xs text-gray-500">
              ({scenarios[name].fact_count} facts)
            </span>
          </button>
        ))}
      </div>
      {result && (
        <div className="text-sm text-green">{result}</div>
      )}
    </div>
  )
}
