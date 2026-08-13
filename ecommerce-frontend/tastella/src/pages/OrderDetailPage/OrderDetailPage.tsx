import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { API_BASE_URL } from '../../config/api'
import { authFetch } from '../../util/authFetch'
import type { Order } from '../../types/order'
import './OrderDetailPage.css'

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

function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/orders`)

        if (!response.ok) {
          throw new Error('Failed to load order')
        }

        const orders = (await response.json()) as Order[]
        const index = orders.findIndex((o) => String(o.id) === id)

        if (index === -1) {
          setOrder(null)
        } else {
          setOrder(orders[index])
          setOrderNumber(orders.length - index)
        }
      } catch {
        setError('Unable to load this order.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  return (
    <>
      <Header showSearch={false} showAccountMenu />
      <div className="order-detail-page">
        {isLoading ? (
          <p className="order-detail-empty">Loading order...</p>
        ) : error || !order ? (
          <p className="order-detail-empty">
            {error || 'Order not found.'} <Link to="/orders">View your orders</Link>
          </p>
        ) : (
          <>
            <div className="order-detail-header">
              <div className="order-detail-heading-row">
                <h1 className="order-detail-title">Order confirmed</h1>
                <span className="order-detail-status">{STATUS_LABELS[order.status]}</span>
              </div>
              <p className="order-detail-subtitle">
                Order #{orderNumber} · Placed {formatDate(order.createdAt)}
              </p>
              <p className="order-detail-email-notice">
                A confirmation email is on its way to your inbox.
              </p>
            </div>

            <div className="order-detail-layout">
              <div className="order-detail-main">
                <section className="order-detail-section">
                  <h2>Items</h2>
                  <ul className="order-detail-items">
                    {order.items.map((item) => (
                      <li key={item.id} className="order-detail-item">
                        {item.product.imageUrl ? (
                          <img
                            className="order-detail-item-image"
                            src={item.product.imageUrl}
                            alt={item.productName}
                          />
                        ) : (
                          <div className="order-detail-item-image-placeholder" />
                        )}
                        <div className="order-detail-item-info">
                          <p className="order-detail-item-name">{item.productName}</p>
                          <p className="order-detail-item-meta">Qty {item.quantity}</p>
                        </div>
                        <p className="order-detail-item-price">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="order-detail-section">
                  <h2>Delivery</h2>
                  <p className="order-detail-text">
                    {order.street}, {order.city} {order.state} {order.zip}
                  </p>
                  {order.instructions && (
                    <p className="order-detail-text">{order.instructions}</p>
                  )}
                  <p className="order-detail-text">
                    {order.deliveryOption === 'SCHEDULED' && order.scheduledTime
                      ? `Scheduled for ${formatDate(order.scheduledTime)}`
                      : order.deliveryOption.charAt(0) +
                        order.deliveryOption.slice(1).toLowerCase() +
                        ' delivery'}
                  </p>
                </section>

                <section className="order-detail-section">
                  <h2>Payment</h2>
                  <p className="order-detail-text">
                    {order.payment.cardBrand} ending in {order.payment.last4}
                  </p>
                  <p className="order-detail-text">Mock payment · not actually charged</p>
                </section>
              </div>

              <aside className="order-detail-sidebar">
                <div className="order-detail-summary-box">
                  <h2 className="order-detail-summary-title">Summary</h2>
                  <div className="order-detail-summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="order-detail-summary-row">
                    <span>Delivery</span>
                    <span>{formatPrice(order.deliveryFee)}</span>
                  </div>
                  <div className="order-detail-summary-row">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="order-detail-summary-total">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </aside>
            </div>

            <div className="order-detail-links">
              <Link to="/orders">View all orders</Link>
              <Link to="/searchPage">Continue shopping</Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default OrderDetailPage
