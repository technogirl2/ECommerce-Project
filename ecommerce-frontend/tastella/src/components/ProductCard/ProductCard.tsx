import { useState } from 'react'
import type { MouseEvent } from 'react'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/product'
import './ProductCard.css'

interface ProductCardProps extends Product {
  quantity?: number
  onClick?: () => void
}

function ProductCard({ id, name, price, imageUrl, quantity, onClick }: ProductCardProps) {
  const { getCartItemForProduct, addItem, updateItemQuantity } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cartItem = getCartItemForProduct(id)
  const isOutOfStock = quantity === 0
  const isAtStockLimit = quantity !== undefined && !!cartItem && cartItem.quantity >= quantity

  const formattedPrice = price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  const withStoppedPropagation =
    (handler: () => Promise<void>) => async (e: MouseEvent) => {
      e.stopPropagation()
      if (isSubmitting) return
      setIsSubmitting(true)
      try {
        await handler()
      } finally {
        setIsSubmitting(false)
      }
    }

  const handleAdd = withStoppedPropagation(() => addItem(id, 1))
  const handleIncrement = withStoppedPropagation(() =>
    updateItemQuantity(cartItem!.id, cartItem!.quantity + 1),
  )
  const handleDecrement = withStoppedPropagation(() =>
    updateItemQuantity(cartItem!.id, cartItem!.quantity - 1),
  )

  return (
    <div
      className="product-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className="product-card-image-wrap">
        {imageUrl && (
          <img className="product-card-image" src={imageUrl} alt={name} />
        )}

        {cartItem ? (
          <div className="product-card-stepper" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="product-card-stepper-btn"
              onClick={handleDecrement}
              disabled={isSubmitting}
              aria-label={cartItem.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
            >
              {cartItem.quantity === 1 ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
            <span className="product-card-stepper-count">{cartItem.quantity} ct</span>
            <button
              type="button"
              className="product-card-stepper-btn"
              onClick={handleIncrement}
              disabled={isSubmitting || isOutOfStock || isAtStockLimit}
              aria-label={isAtStockLimit ? 'No more in stock' : 'Increase quantity'}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        ) : isOutOfStock ? (
          <button type="button" className="product-card-add product-card-add-disabled" disabled>
            Out of stock
          </button>
        ) : (
          <button
            type="button"
            className="product-card-add"
            onClick={handleAdd}
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        )}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-name">{name}</h3>
        <p className="product-card-price">{formattedPrice}</p>
        {isAtStockLimit && (
          <p className="product-card-stock-warning">No more in stock</p>
        )}
      </div>
    </div>
  )
}

export default ProductCard
