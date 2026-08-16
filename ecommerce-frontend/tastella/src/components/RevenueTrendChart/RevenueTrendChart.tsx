import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { OrderTrendPoint } from '../../types/analytics'
import './RevenueTrendChart.css'

interface RevenueTrendChartProps {
  data: OrderTrendPoint[]
}

const WIDTH = 760
const HEIGHT = 260
const PAD = { top: 20, right: 20, bottom: 32, left: 64 }
const INNER_WIDTH = WIDTH - PAD.left - PAD.right
const INNER_HEIGHT = HEIGHT - PAD.top - PAD.bottom

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function niceMax(max: number): number {
  if (max <= 0) return 10
  const magnitude = 10 ** Math.floor(Math.log10(max))
  const normalized = max / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const maxRevenue = useMemo(() => niceMax(Math.max(...data.map((d) => d.revenue), 0)), [data])

  const xAt = (index: number) =>
    data.length <= 1
      ? PAD.left + INNER_WIDTH / 2
      : PAD.left + (index / (data.length - 1)) * INNER_WIDTH
  const yAt = (value: number) => PAD.top + INNER_HEIGHT - (value / maxRevenue) * INNER_HEIGHT

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.revenue)}`).join(' ')
  const areaPath =
    data.length > 0
      ? `${linePath} L ${xAt(data.length - 1)} ${yAt(0)} L ${xAt(0)} ${yAt(0)} Z`
      : ''

  const yTicks = [0, maxRevenue / 2, maxRevenue]

  const xTickIndices = useMemo(() => {
    if (data.length <= 6) return data.map((_, i) => i)
    const count = 6
    return Array.from({ length: count }, (_, i) => Math.round((i / (count - 1)) * (data.length - 1)))
  }, [data])

  const handlePointerMove = (e: ReactPointerEvent<SVGRectElement>) => {
    if (data.length === 0) return
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    const ratio = (relativeX - PAD.left) / INNER_WIDTH
    const index = Math.round(ratio * (data.length - 1))
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1))
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="revenue-trend-chart">
      <div className="revenue-trend-chart-header">
        <h3>Revenue over time</h3>
        <button type="button" className="chart-table-toggle" onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'View as chart' : 'View as table'}
        </button>
      </div>

      {data.length === 0 ? (
        <p className="revenue-trend-chart-empty">No orders in this period.</p>
      ) : showTable ? (
        <div className="chart-table-wrap">
          <table className="chart-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{dateLabel.format(new Date(d.date))}</td>
                  <td>{d.orderCount}</td>
                  <td>{currency.format(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="revenue-trend-chart-plot">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="revenue-trend-chart-svg" role="img" aria-label="Revenue over time">
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={yAt(tick)}
                  y2={yAt(tick)}
                  className="chart-gridline"
                />
                <text x={PAD.left - 10} y={yAt(tick)} className="chart-axis-label" textAnchor="end" dominantBaseline="middle">
                  {compactCurrency.format(tick)}
                </text>
              </g>
            ))}

            {xTickIndices.map((i) => (
              <text
                key={i}
                x={xAt(i)}
                y={HEIGHT - PAD.bottom + 20}
                className="chart-axis-label"
                textAnchor="middle"
              >
                {dateLabel.format(new Date(data[i].date))}
              </text>
            ))}

            <path d={areaPath} className="revenue-trend-chart-area" />
            <path d={linePath} className="revenue-trend-chart-line" />

            {data.length > 0 && (
              <>
                <circle
                  cx={xAt(data.length - 1)}
                  cy={yAt(data[data.length - 1].revenue)}
                  r={4}
                  className="revenue-trend-chart-end-dot"
                />
                <text
                  x={xAt(data.length - 1)}
                  y={yAt(data[data.length - 1].revenue) - 12}
                  className="chart-direct-label"
                  textAnchor="end"
                >
                  {currency.format(data[data.length - 1].revenue)}
                </text>
              </>
            )}

            {hovered && (
              <>
                <line
                  x1={xAt(hoverIndex!)}
                  x2={xAt(hoverIndex!)}
                  y1={PAD.top}
                  y2={HEIGHT - PAD.bottom}
                  className="chart-crosshair"
                />
                <circle cx={xAt(hoverIndex!)} cy={yAt(hovered.revenue)} r={5} className="chart-hover-dot" />
              </>
            )}

            <rect
              x={PAD.left}
              y={PAD.top}
              width={INNER_WIDTH}
              height={INNER_HEIGHT}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </svg>

          {hovered && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(xAt(hoverIndex!) / WIDTH) * 100}%`,
                top: `${(yAt(hovered.revenue) / HEIGHT) * 100}%`,
              }}
            >
              <div className="chart-tooltip-value">{currency.format(hovered.revenue)}</div>
              <div className="chart-tooltip-meta">{dateLabel.format(new Date(hovered.date))}</div>
              <div className="chart-tooltip-meta">
                {hovered.orderCount} order{hovered.orderCount === 1 ? '' : 's'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RevenueTrendChart
