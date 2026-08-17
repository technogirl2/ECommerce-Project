import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { OrderTrendPoint, TopProduct } from '../types/analytics'

export async function fetchOrderTrends(days: number): Promise<OrderTrendPoint[]> {
  const response = await authFetch(`${API_BASE_URL}/admin/analytics/order-trends?days=${days}`)
  if (!response.ok) throw new Error('Failed to load order trends')
  return (await response.json()) as OrderTrendPoint[]
}

export async function fetchTopProducts(days: number, limit = 10): Promise<TopProduct[]> {
  const response = await authFetch(
    `${API_BASE_URL}/admin/analytics/top-products?days=${days}&limit=${limit}`,
  )
  if (!response.ok) throw new Error('Failed to load top products')
  return (await response.json()) as TopProduct[]
}
