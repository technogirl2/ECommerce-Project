import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { Order } from '../types/order'

export async function fetchAllOrdersAdmin(): Promise<Order[]> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders`)
  if (!response.ok) throw new Error('Failed to load orders')
  return (await response.json()) as Order[]
}

export async function fetchOrderByIdAdmin(id: string): Promise<Order | null> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders/${id}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Failed to load order')
  return (await response.json()) as Order
}
