import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { SnackType } from '../types/snackType'

export async function fetchSnackTypes(): Promise<SnackType[]> {
  const response = await authFetch(`${API_BASE_URL}/snack-types`)
  if (!response.ok) throw new Error('Failed to load snack types')
  return (await response.json()) as SnackType[]
}
