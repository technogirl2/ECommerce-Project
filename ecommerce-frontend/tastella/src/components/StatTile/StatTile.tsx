import './StatTile.css'

interface StatTileProps {
  label: string
  value: string
  helpText?: string
}

function StatTile({ label, value, helpText }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-label">{label}</span>
      <span className="stat-tile-value">{value}</span>
      {helpText && <span className="stat-tile-help">{helpText}</span>}
    </div>
  )
}

export default StatTile
