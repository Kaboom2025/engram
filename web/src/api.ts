import type { ComparisonResult, GraphData, Scenario } from './types'

const BASE = '/api'

export async function fetchGraph(): Promise<GraphData> {
  const res = await fetch(`${BASE}/graph`)
  if (!res.ok) throw new Error(`Graph fetch failed: ${res.status}`)
  return res.json()
}

export async function searchQuery(query: string): Promise<ComparisonResult> {
  const res = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

export async function ingestScenario(scenario: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  })
  if (!res.ok) throw new Error(`Ingest failed: ${res.status}`)
  return res.json()
}

export async function fetchScenarios(): Promise<Record<string, Scenario>> {
  const res = await fetch(`${BASE}/scenarios`)
  if (!res.ok) throw new Error(`Scenarios fetch failed: ${res.status}`)
  return res.json()
}
