import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { fetchOrderByIdAdmin } from '../../api/orders'
import type { Order } from '../../types/order'
import './AdminOrderDetailPage.css'

const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const STATUS_LABELS: Record<Order['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setIsLoading(true)
      setError('')
      try {
        setOrder(await fetchOrderByIdAdmin(id))
      } catch {
        setError('Unable to load this order.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [id])

  return (
    <>
      <Header showSearch={false} showAccountMenu />
      <div className="admin-order-detail-page">
        {isLoading ? (
          <p className="admin-order-detail-empty">Loading order...</p>
        ) : error || !order ? (
          <p className="admin-order-detail-empty">
            {error || 'Order not found.'} <Link to="/admin/orders">View all orders</Link>
          </p>
        ) : (
          <>
            <div className="admin-order-detail-header">
              <div className="admin-order-detail-heading-row">
                <h1 className="admin-order-detail-title">Order #{order.id}</h1>
                <span className="admin-order-detail-status">{STATUS_LABELS[order.status]}</span>
              </div>
              <p className="admin-order-detail-subtitle">
                Placed {formatDate(order.createdAt)}
              </p>
              <p className="admin-order-detail-customer">
                Customer: {order.user?.email ?? 'Unknown customer'}
              </p>
            </div>

            <div className="admin-order-detail-layout">
              <div className="admin-order-detail-main">
                <section className="admin-order-detail-section">
                  <h2>Items</h2>
                  <ul className="admin-order-detail-items">
                    {order.items.map((item) => (
                      <li key={item.id} className="admin-order-detail-item">
                        {item.product.imageUrl ? (
                          <img
                            className="admin-order-detail-item-image"
                            src={item.product.imageUrl}
                            alt={item.productName}
                          />
                        ) : (
                          <div className="admin-order-detail-item-image-placeholder" />
                        )}
                        <div className="admin-order-detail-item-info">
                          <p className="admin-order-detail-item-name">{item.productName}</p>
                          <p className="admin-order-detail-item-meta">Qty {item.quantity}</p>
                        </div>
                        <p className="admin-order-detail-item-price">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="admin-order-detail-section">
                  <h2>Delivery</h2>
                  <p className="admin-order-detail-text">
                    {order.street}, {order.city} {order.state} {order.zip}
                  </p>
                  {order.instructions && (
                    <p className="admin-order-detail-text">{order.instructions}</p>
                  )}
                  <p className="admin-order-detail-text">
                    {order.deliveryOption === 'SCHEDULED' && order.scheduledTime
                      ? `Scheduled for ${formatDate(order.scheduledTime)}`
                      : order.deliveryOption.charAt(0) +
                        order.deliveryOption.slice(1).toLowerCase() +
                        ' delivery'}
                  </p>
                </section>

                <section className="admin-order-detail-section">
                  <h2>Payment</h2>
                  <p className="admin-order-detail-text">
                    {order.payment.cardBrand} ending in {order.payment.last4}
                  </p>
                  <p className="admin-order-detail-text">Mock payment · not actually charged</p>
                </section>
              </div>

              <aside className="admin-order-detail-sidebar">
                <div className="admin-order-detail-summary-box">
                  <h2 className="admin-order-detail-summary-title">Summary</h2>
                  <div className="admin-order-detail-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="admin-order-detail-summary-row">
                    <span>Delivery</span>
                    <span>{formatPrice(order.deliveryFee)}</span>
                  </div>
                  <div className="admin-order-detail-summary-row">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="admin-order-detail-summary-total">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </aside>
            </div>

            <div className="admin-order-detail-links">
              <Link to="/admin/orders">View all orders</Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AdminOrderDetailPage
