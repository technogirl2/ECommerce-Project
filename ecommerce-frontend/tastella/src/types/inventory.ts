import type { Product } from './product'

export interface Inventory {
  id: number
  product: Product
  quantity: number
}
