import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header/Header'
import StatTile from '../../components/StatTile/StatTile'
import RevenueTrendChart from '../../components/RevenueTrendChart/RevenueTrendChart'
import TopProductsChart from '../../components/TopProductsChart/TopProductsChart'
import { fetchOrderTrends, fetchTopProducts } from '../../api/analytics'
import type { OrderTrendPoint, TopProduct } from '../../types/analytics'
import './AdminAnalyticsPage.css'

const RANGE_OPTIONS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const [orderTrends, setOrderTrends] = useState<OrderTrendPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [trends, products] = await Promise.all([fetchOrderTrends(days), fetchTopProducts(days, 10)])
        if (cancelled) return
        setOrderTrends(trends)
        setTopProducts(products)
      } catch {
        if (!cancelled) setError('Unable to load analytics. Please try again later.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [days])

  const totals = useMemo(() => {
    const totalRevenue = orderTrends.reduce((sum, point) => sum + point.revenue, 0)
    const totalOrders = orderTrends.reduce((sum, point) => sum + point.orderCount, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    return { totalRevenue, totalOrders, avgOrderValue }
  }, [orderTrends])

  return (
    <>
      <Header showSearch={false} showAccountMenu showCart={false} />
      <div className="admin-analytics-page">
        <div className="admin-analytics-header">
          <h1>Analytics</h1>
          <div className="admin-analytics-range" role="group" aria-label="Date range">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.days}
                type="button"
                className={days === option.days ? 'is-active' : ''}
                onClick={() => setDays(option.days)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="admin-analytics-empty">{error}</p>
        ) : isLoading ? (
          <p className="admin-analytics-empty">Loading analytics...</p>
        ) : (
          <>
            <div className="admin-analytics-kpis">
              <StatTile label="Total revenue" value={currency.format(totals.totalRevenue)} />
              <StatTile label="Total orders" value={totals.totalOrders.toLocaleString('en-US')} />
              <StatTile label="Average order value" value={currency.format(totals.avgOrderValue)} />
            </div>

            <div className="admin-analytics-charts">
              <RevenueTrendChart data={orderTrends} />
              <TopProductsChart data={topProducts} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AdminAnalyticsPage
