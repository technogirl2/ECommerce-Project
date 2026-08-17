import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../../api/chat'
import type { ChatMessage } from '../../types/chat'
import type { Product } from '../../types/product'
import './ChatWidget.css'

const GREETING: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm Tastella's shopping assistant. Ask me about snacks or drinks you're looking for.",
}

interface ChatWidgetProps {
  onSelectProduct?: (product: Product) => void
}

function ChatWidget({ onSelectProduct }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed || isSending) return

    const nextMessages = [...messages, { role: 'user', content: trimmed } as ChatMessage]
    setMessages(nextMessages)
    setDraft('')
    setError('')
    setIsSending(true)

    try {
      const { reply, products } = await sendChatMessage(nextMessages)
      setMessages([...nextMessages, { role: 'assistant', content: reply, products }])
    } catch {
      setError('The assistant is unavailable right now. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-widget-panel" role="dialog" aria-label="Shopping assistant">
          <div className="chat-widget-header">
            <span>Shopping Assistant</span>
            <button
              type="button"
              className="chat-widget-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-widget-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chat-widget-message chat-widget-message-${message.role}`}>
                {message.content}
                {message.products && message.products.length > 0 && (
                  <div className="chat-widget-products">
                    {message.products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="chat-widget-product"
                        onClick={() => onSelectProduct?.(product)}
                      >
                        {product.imageUrl ? (
                          <img
                            className="chat-widget-product-image"
                            src={product.imageUrl}
                            alt={product.name}
                          />
                        ) : (
                          <div className="chat-widget-product-image-placeholder" />
                        )}
                        <span className="chat-widget-product-name">{product.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="chat-widget-message chat-widget-message-assistant chat-widget-typing">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <p className="chat-widget-error">{error}</p>}

          <div className="chat-widget-input-row">
            <textarea
              className="chat-widget-input"
              placeholder="Ask about a snack..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              type="button"
              className="chat-widget-send-btn"
              onClick={handleSend}
              disabled={isSending || !draft.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="chat-widget-toggle-btn"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close shopping assistant' : 'Open shopping assistant'}
      >
        {isOpen ? (
          '×'
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default ChatWidget
