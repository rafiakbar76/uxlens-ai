import React from 'react'

export default function InsightCard({ insight }) {
  if (!insight) return null
  if (insight.error) return <div className="card"><strong>Error:</strong> <pre className="error">{insight.error}</pre></div>

  return (
    <div className="card" role="region" aria-live="polite">
      <h2>Ringkasan</h2>
      <pre>{insight.summary || insight.raw || 'Tidak ada ringkasan.'}</pre>

      <h3>Poin utama & rekomendasi</h3>
      <pre>{insight.findings || ''}</pre>

      <h3>Checklist</h3>
      <pre>{insight.checklist || ''}</pre>
    </div>
  )
}
