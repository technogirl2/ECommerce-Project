import type { SnackType } from './snackType'

export interface Product {
  id: number
  name: string
  price: number
  imageUrl?: string
  brand: string
  snackType: SnackType
}
