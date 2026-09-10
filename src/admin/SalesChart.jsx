export default function SalesChart({ series }) {
  const width = 640
  const height = 220
  const pad = { l: 36, r: 12, t: 16, b: 36 }
  const values = (series || []).map((p) => Number(p.sales) || 0)
  const max = Math.max(1, ...values)
  const n = Math.max(1, values.length)
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const gap = 8
  const barW = Math.max(8, innerW / n - gap)

  return (
    <svg className="admin-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales chart">
      {[0, 0.5, 1].map((t) => {
        const y = pad.t + innerH * (1 - t)
        return (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#e4dcce" />
            <text x={4} y={y + 4} fontSize="10" fill="#7a7368">
              {Math.round(max * t)}
            </text>
          </g>
        )
      })}
      {series.map((point, i) => {
        const h = (values[i] / max) * innerH
        const x = pad.l + i * (innerW / n) + gap / 2
        const y = pad.t + innerH - h
        return (
          <g key={point.label}>
            <rect x={x} y={y} width={barW} height={Math.max(2, h)} rx="6" fill="#2f6b47" />
            <text x={x + barW / 2} y={height - 10} textAnchor="middle" fontSize="9" fill="#7a7368">
              {point.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
