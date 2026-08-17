import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'
import { API_BASE_URL } from '../../config/api'
import { useCart } from '../../context/CartContext'
import { getRoleFromToken } from '../../util/jwt'
import './Header.css'

interface HeaderProps {
  onSearch?: (query: string) => void
  showSearch?: boolean
  showAccountMenu?: boolean
  showCart?: boolean
}

function Header({
  onSearch,
  showSearch = true,
  showAccountMenu = false,
  showCart = false,
}: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, refreshCart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const token = localStorage.getItem('token')
  const isAdmin = token ? getRoleFromToken(token) === 'ADMIN' : false
  const isAdminView = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (showCart) refreshCart()
  }, [showCart, refreshCart])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleLogout = async () => {
    setIsMenuOpen(false)
    const refreshToken = localStorage.getItem('refreshToken')

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/user-logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
      } catch {
        // best-effort; still clear local session below
      }
    }

    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  const goTo = (path: string) => {
    setIsMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="header">
      <button
        type="button"
        className="header-logo"
        onClick={() => navigate('/searchPage')}
      >
        Tastella
      </button>
      {showSearch && <SearchBar onSearch={onSearch} />}
      {showAccountMenu && isAdmin && (
        <div className="header-view-toggle" role="group" aria-label="View as">
          <button
            type="button"
            className={!isAdminView ? 'is-active' : ''}
            onClick={() => navigate('/searchPage')}
          >
            Customer
          </button>
          <button
            type="button"
            className={location.pathname.startsWith('/admin/products') ? 'is-active' : ''}
            onClick={() => navigate('/admin/products')}
          >
            Products
          </button>
          <button
            type="button"
            className={location.pathname.startsWith('/admin/analytics') ? 'is-active' : ''}
            onClick={() => navigate('/admin/analytics')}
          >
            Analytics
          </button>
          <button
            type="button"
            className={location.pathname.startsWith('/admin/orders') ? 'is-active' : ''}
            onClick={() => navigate('/admin/orders')}
          >
            Orders
          </button>
        </div>
      )}
      {showAccountMenu && (
        <div className="header-account" ref={menuRef}>
          <button
            type="button"
            className="header-account-trigger"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-label="Account menu"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </button>

          <div className={`header-account-dropdown${isMenuOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="header-account-item"
              onClick={() => goTo('/orders')}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 3h6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1Z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              Order history
            </button>
            <button
              type="button"
              className="header-account-item"
              onClick={() => goTo('/account')}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
              Account settings
            </button>
            <button
              type="button"
              className="header-account-item header-account-item-logout"
              onClick={handleLogout}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
      {showCart && (
        <button
          type="button"
          className="header-cart"
          onClick={() => navigate('/checkout')}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>Cart ({cartCount})</span>
        </button>
      )}
    </header>
  )
}

export default Header
