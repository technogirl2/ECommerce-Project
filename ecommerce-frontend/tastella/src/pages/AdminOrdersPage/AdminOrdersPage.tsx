import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { fetchAllOrdersAdmin } from '../../api/orders'
import type { Order } from '../../types/order'
import './AdminOrdersPage.css'

const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' })

const STATUS_LABELS: Record<Order['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        setOrders(await fetchAllOrdersAdmin())
      } catch {
        setError('Unable to load orders. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const visibleOrders = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return orders
    return orders.filter(
      (order) =>
        String(order.id).includes(trimmed) ||
        (order.user?.email ?? '').toLowerCase().includes(trimmed),
    )
  }, [orders, query])

  return (
    <>
      <Header showSearch={false} showAccountMenu />
      <div className="admin-orders-page">
        <div className="admin-orders-header">
          <h1>Orders</h1>
          <input
            type="text"
            className="admin-orders-search"
            placeholder="Search by order # or customer email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="admin-orders-empty">Loading orders...</p>
        ) : error ? (
          <p className="admin-orders-empty">{error}</p>
        ) : visibleOrders.length === 0 ? (
          <p className="admin-orders-empty">No orders match your search.</p>
        ) : (
          <ul className="admin-orders-list">
            {visibleOrders.map((order) => (
              <li key={order.id} className="admin-orders-item">
                <Link to={`/admin/orders/${order.id}`} className="admin-orders-link">
                  <div className="admin-orders-item-main">
                    <p className="admin-orders-item-id">Order #{order.id}</p>
                    <p className="admin-orders-item-customer">{order.user?.email ?? 'Unknown customer'}</p>
                  </div>
                  <p className="admin-orders-item-date">{formatDate(order.createdAt)}</p>
                  <p className="admin-orders-item-items">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </p>
                  <span className="admin-orders-item-status">{STATUS_LABELS[order.status]}</span>
                  <p className="admin-orders-item-total">{formatPrice(order.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default AdminOrdersPage
