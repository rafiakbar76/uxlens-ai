import ScoreCard from './ScoreCard'

export default function ResultCard({ insight }) {
  if (!insight) {
    return <div className="card"><p>Belum ada hasil. Silakan lakukan analisis terlebih dahulu.</p></div>
  }

  if (insight.error) {
    return (
      <div className="card">
        <strong>Error:</strong>
        <pre>{insight.error}</pre>
      </div>
    )
  }

  // Check if it's the new format (with ux_score) or old format
  if (insight.ux_score !== undefined) {
    // New format for reviews
    const score = insight.ux_score
    const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'

    return (
      <div className="card-grid">
        <div className="card">
          <div className="result-block">
            <div className="result-meta">
              <h2>UX Score</h2>
              <div className="score-display">
                <span className="score-number">{score}</span>
                <span className="score-label">/ 100 ({scoreLabel})</span>
              </div>
            </div>

            <div className="result-meta">
              <h3>Sentiment Breakdown</h3>
              <div className="sentiment-breakdown">
                <div className="sentiment-item">
                  <span className="sentiment-label">Positive:</span>
                  <span className="sentiment-value">{insight.sentiment?.positive || 0}%</span>
                </div>
                <div className="sentiment-item">
                  <span className="sentiment-label">Negative:</span>
                  <span className="sentiment-value">{insight.sentiment?.negative || 0}%</span>
                </div>
              </div>
            </div>

            <div className="result-meta">
              <h3>Key UX Issues</h3>
              <ul className="issues-list">
                {insight.issues?.map((issue, index) => (
                  <li key={index}>{issue}</li>
                )) || <li>No issues identified</li>}
              </ul>
            </div>

            <div className="result-meta">
              <h3>AI Insight</h3>
              <p>{insight.insight || 'No insight available'}</p>
            </div>

            <div className="result-meta">
              <h3>Recommendations</h3>
              <ul className="recommendations-list">
                {insight.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                )) || <li>No recommendations available</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    // Old format for images/pages
    return (
      <div className="card-grid">
        <div className="card">
          <div className="result-block">
            <div className="result-meta">
              <h2>Ringkasan</h2>
              <pre>{insight.summary || insight.raw || 'Tidak ada ringkasan.'}</pre>
            </div>

            <div className="result-meta">
              <h3>Poin Utama & Rekomendasi</h3>
              <pre>{insight.findings || 'Tidak ada temuan.'}</pre>
            </div>

            <div className="result-meta">
              <h3>Checklist</h3>
              <pre>{insight.checklist || 'Tidak ada checklist.'}</pre>
            </div>
          </div>
        </div>
        <ScoreCard insight={insight} />
      </div>
    )
  }
}
