import type { Product } from './product'

export type DeliveryOptionType = 'STANDARD' | 'PRIORITY' | 'SCHEDULED'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED'

export interface Payment {
  id: number
  provider: string
  providerPaymentId: string
  cardBrand: string
  last4: string
  status: PaymentStatus
  createdAt: string
}

export interface OrderItem {
  id: number
  product: Product
  productName: string
  unitPrice: number
  quantity: number
}

export interface OrderCustomer {
  id: number
  email: string
}

export interface Order {
  id: number
  user?: OrderCustomer
  status: OrderStatus
  street: string
  city: string
  state: string
  zip: string
  instructions: string
  deliveryOption: DeliveryOptionType
  scheduledTime: string | null
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  createdAt: string
  items: OrderItem[]
  payment: Payment
}

export interface CheckoutRequest {
  street: string
  city: string
  state: string
  zip: string
  instructions: string
  deliveryOption: DeliveryOptionType
  scheduledTime: string | null
  cardBrand: string
  last4: string
}
