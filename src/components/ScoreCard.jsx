export default function ScoreCard({ insight }) {
  const findingCount = insight?.findings ? insight.findings.trim().split(/\n+/).filter(Boolean).length : 0
  const checklistCount = insight?.checklist ? insight.checklist.trim().split(/\n+/).filter(Boolean).length : 0

  return (
    <aside className="score-card">
      <div className="score-box">
        <strong>Ringkasan</strong>
        <span>{insight?.summary ? 'Tersedia' : 'Kosong'}</span>
      </div>
      <div className="score-box">
        <strong>Temuan</strong>
        <span>{findingCount} bagian</span>
      </div>
      <div className="score-box">
        <strong>Checklist</strong>
        <span>{checklistCount} item</span>
      </div>
    </aside>
  )
}
