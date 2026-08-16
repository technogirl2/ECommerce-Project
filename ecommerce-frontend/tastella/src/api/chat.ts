import { API_BASE_URL } from '../config/api'
import { authFetch } from '../util/authFetch'
import type { ChatMessage } from '../types/chat'
import type { Product } from '../types/product'

interface ChatApiResponse {
  reply: string
  products: Product[]
}

export async function sendChatMessage(
  messages: ChatMessage[],
): Promise<{ reply: string; products: Product[] }> {
  const response = await authFetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!response.ok) throw new Error('Failed to reach the assistant')
  const data = (await response.json()) as ChatApiResponse
  return { reply: data.reply, products: data.products ?? [] }
}
