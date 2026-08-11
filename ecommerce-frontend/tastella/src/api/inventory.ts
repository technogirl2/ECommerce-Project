import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { Inventory } from '../types/inventory'

export async function fetchAllInventory(): Promise<Inventory[]> {
  const response = await authFetch(`${API_BASE_URL}/inventory`)
  if (!response.ok) throw new Error('Failed to load inventory')
  return (await response.json()) as Inventory[]
}

export async function fetchInventoryByProductId(productId: number): Promise<Inventory> {
  const response = await authFetch(`${API_BASE_URL}/inventory/product/${productId}`)
  if (!response.ok) throw new Error('Failed to load inventory')
  return (await response.json()) as Inventory
}

export async function updateInventoryQuantity(id: number, quantity: number): Promise<Inventory> {
  const response = await authFetch(`${API_BASE_URL}/update-inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
  if (!response.ok) throw new Error('Failed to update inventory')
  return (await response.json()) as Inventory
}
