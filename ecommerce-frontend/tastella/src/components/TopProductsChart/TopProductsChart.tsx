import { useMemo, useState } from 'react'
import type { TopProduct } from '../../types/analytics'
import './TopProductsChart.css'

interface TopProductsChartProps {
  data: TopProduct[]
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function TopProductsChart({ data }: TopProductsChartProps) {
  const [showTable, setShowTable] = useState(false)
  const maxQuantity = useMemo(() => Math.max(...data.map((p) => p.quantitySold), 1), [data])

  return (
    <div className="top-products-chart">
      <div className="top-products-chart-header">
        <h3>Top-selling products</h3>
        <button type="button" className="chart-table-toggle" onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'View as chart' : 'View as table'}
        </button>
      </div>

      {data.length === 0 ? (
        <p className="top-products-chart-empty">No orders in this period.</p>
      ) : showTable ? (
        <div className="chart-table-wrap">
          <table className="chart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.productId}>
                  <td>{p.productName}</td>
                  <td>{p.quantitySold}</td>
                  <td>{currency.format(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="top-products-rows">
          {data.map((product) => {
            const pct = Math.max((product.quantitySold / maxQuantity) * 100, 4)
            return (
              <div className="top-products-row" key={product.productId} tabIndex={0}>
                {product.imageUrl ? (
                  <img className="top-products-thumb" src={product.imageUrl} alt={product.productName} />
                ) : (
                  <div className="top-products-thumb top-products-thumb-placeholder" />
                )}
                <span className="top-products-name">{product.productName}</span>
                <div className="top-products-bar-track">
                  <div className="top-products-bar" style={{ width: `${pct}%` }} />
                </div>
                <span className="top-products-value">{product.quantitySold}</span>

                <div className="top-products-tooltip">
                  <div className="chart-tooltip-value">{product.quantitySold} sold</div>
                  <div className="chart-tooltip-meta">{currency.format(product.revenue)} revenue</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TopProductsChart
