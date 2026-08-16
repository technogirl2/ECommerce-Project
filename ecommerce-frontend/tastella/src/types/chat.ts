import type { Product } from './product'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
}
