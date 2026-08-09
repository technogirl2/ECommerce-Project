import { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/product'
import './ProductPopComponent.css'

interface ProductPopComponentProps {
  product: Product
  onClose: () => void
}

const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1)

function ProductPopComponent({ product, onClose }: ProductPopComponentProps) {
  const { getCartItemForProduct, addItem, updateItemQuantity, removeItem, refreshCart } =
    useCart()
  const cartItem = getCartItemForProduct(product.id)
  const [quantityOverride, setQuantityOverride] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const quantity = quantityOverride ?? cartItem?.quantity ?? 1

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const formattedPrice = product.price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  const handleAddToCart = async () => {
    setIsSubmitting(true)
    try {
      await addItem(product.id, quantity)
      setQuantityOverride(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateQuantity = async () => {
    if (!cartItem) return

    setIsSubmitting(true)
    try {
      await updateItemQuantity(cartItem.id, quantity)
      setQuantityOverride(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    if (!cartItem) return

    setIsSubmitting(true)
    try {
      await removeItem(cartItem.id)
      setQuantityOverride(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isInCart = cartItem !== undefined

  return (
    <div className="product-pop-overlay" onClick={onClose}>
      <div
        className="product-pop"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="product-pop-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="product-pop-body">
          <div className="product-pop-image-wrap">
            {product.imageUrl ? (
              <img
                className="product-pop-image"
                src={product.imageUrl}
                alt={product.name}
              />
            ) : (
              <div className="product-pop-image-placeholder" />
            )}
          </div>

          <div className="product-pop-info">
            <h2 className="product-pop-name">{product.name}</h2>
            <p className="product-pop-meta">
              {product.brand} · {product.snackType.name}
            </p>
          </div>

          <div className="product-pop-purchase">
            <p className="product-pop-price">{formattedPrice}</p>

            {isInCart && (
              <p className="product-pop-in-cart">
                ✓ In your cart ({cartItem.quantity})
              </p>
            )}

            <label className="product-pop-quantity">
              <span>Quantity</span>
              <select
                value={quantity}
                onChange={(e) => setQuantityOverride(Number(e.target.value))}
              >
                {QUANTITY_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            {isInCart ? (
              <>
                <button
                  type="button"
                  className="product-pop-add"
                  onClick={handleUpdateQuantity}
                  disabled={isSubmitting || quantity === cartItem.quantity}
                >
                  Update cart
                </button>
                <button
                  type="button"
                  className="product-pop-remove"
                  onClick={handleRemove}
                  disabled={isSubmitting}
                >
                  Remove from cart
                </button>
              </>
            ) : (
              <button
                type="button"
                className="product-pop-add"
                onClick={handleAddToCart}
                disabled={isSubmitting}
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPopComponent
