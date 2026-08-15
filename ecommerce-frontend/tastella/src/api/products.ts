import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { Product } from '../types/product'

export async function fetchAllProducts(): Promise<Product[]> {
  const response = await authFetch(`${API_BASE_URL}/products`)
  if (!response.ok) throw new Error('Failed to load products')
  return (await response.json()) as Product[]
}

export async function searchProducts(query: string, topK = 3): Promise<Product[]> {
  const params = new URLSearchParams({ q: query, topK: String(topK) })
  const response = await authFetch(`${API_BASE_URL}/products/search?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to search products')
  return (await response.json()) as Product[]
}
