import type { SearchResult } from '../types'

interface RetrievalComparisonProps {
  engram: SearchResult
  naive: SearchResult
}

export function RetrievalComparison({ engram, naive }: RetrievalComparisonProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ResultCard
        title="Naive RAG"
        subtitle="Vector similarity only"
        result={naive}
        variant="dim"
      />
      <ResultCard
        title="Engram Hybrid"
        subtitle="Vector + Graph + Temporal"
        result={engram}
        variant="highlight"
      />
    </div>
  )
}

interface ResultCardProps {
  title: string
  subtitle: string
  result: SearchResult
  variant: 'dim' | 'highlight'
}

function ResultCard({ title, subtitle, result, variant }: ResultCardProps) {
  const borderClass = variant === 'highlight'
    ? 'border-accent/40'
    : 'border-border'
  const badgeClass = variant === 'highlight'
    ? 'bg-accent/20 text-accent'
    : 'bg-surface-3 text-gray-500'

  return (
    <div className={`rounded-xl border ${borderClass} bg-surface-2 p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-200">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md ${badgeClass}`}>
          {result.retrieval_ms}ms
        </span>
      </div>

      {/* Context preview */}
      <div className="text-sm text-gray-300 leading-relaxed max-h-64 overflow-y-auto">
        {result.context ? (
          <pre className="whitespace-pre-wrap font-sans">{result.context}</pre>
        ) : (
          <span className="text-gray-600 italic">No results found</span>
        )}
      </div>

      {/* Fact count */}
      {result.facts.length > 0 && (
        <div className="text-xs text-gray-500">
          {result.facts.length} structured facts extracted
        </div>
      )}
    </div>
  )
}
