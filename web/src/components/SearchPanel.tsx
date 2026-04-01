import { useState } from 'react'
import { searchQuery } from '../api'
import { ScoreBreakdown } from './ScoreBreakdown'
import { RetrievalComparison } from './RetrievalComparison'
import type { ComparisonResult } from '../types'

const SUGGESTIONS = [
  'What backend framework are we using?',
  'What does Engram depend on?',
  "What are Saalik's preferences?",
  'When did we switch from Django?',
  'How does retrieval work?',
]

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(q: string) {
    const searchText = q || query
    if (!searchText.trim()) return

    setQuery(searchText)
    setLoading(true)
    setError(null)

    try {
      const data = await searchQuery(searchText)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(query) }}
          placeholder="Ask a question about the knowledge graph..."
          className="flex-1 px-4 py-3 rounded-xl bg-surface-2 border border-border text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-dim text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Search'}
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSearch(s)}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg bg-surface-3 border border-border text-gray-400 hover:text-gray-200 hover:border-accent/50 transition-colors disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score Breakdown */}
          <div className="p-5 rounded-xl bg-surface-2 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Retrieval Signal Strength</h3>
              <span className="text-xs text-gray-500 tabular-nums">
                {result.engram.retrieval_ms}ms
              </span>
            </div>
            <ScoreBreakdown
              scores={result.engram.scores}
              weights={result.engram.weights}
            />
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>Vector: {result.engram.source_counts.vector ?? 0} candidates</span>
              <span>Graph: {result.engram.source_counts.graph ?? 0} candidates</span>
              <span>Temporal: {result.engram.source_counts.temporal ?? 0} candidates</span>
            </div>
          </div>

          {/* Side-by-side comparison */}
          <RetrievalComparison engram={result.engram} naive={result.naive} />
        </div>
      )}
    </div>
  )
}
