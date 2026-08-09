import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { SnackType } from '../types/snackType'

export async function fetchSnackTypes(): Promise<SnackType[]> {
  const response = await authFetch(`${API_BASE_URL}/snack-types`)
  if (!response.ok) throw new Error('Failed to load snack types')
  return (await response.json()) as SnackType[]
}

export async function addSnackType(name: string): Promise<SnackType> {
  const response = await authFetch(`${API_BASE_URL}/add-snack-type`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error('Failed to add snack type')
  return (await response.json()) as SnackType
}

export async function updateSnackType(id: number, name: string): Promise<SnackType> {
  const response = await authFetch(`${API_BASE_URL}/update-snack-type/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? 'Failed to update snack type')
  }
  return (await response.json()) as SnackType
}

export async function deleteSnackType(id: number): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/delete-snack-type/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    if (response.status === 409) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message ?? 'This category is still in use and cannot be deleted.')
    }
    throw new Error('Failed to delete snack type')
  }
}
