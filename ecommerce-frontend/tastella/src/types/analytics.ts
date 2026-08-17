export interface OrderTrendPoint {
  date: string
  orderCount: number
  revenue: number
}

export interface TopProduct {
  productId: number
  productName: string
  imageUrl: string | null
  quantitySold: number
  revenue: number
}
