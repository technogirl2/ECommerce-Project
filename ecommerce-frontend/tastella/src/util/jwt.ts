interface DecodedToken {
  sub?: unknown
  role?: unknown
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(normalized)) as DecodedToken
  } catch {
    return null
  }
}

export function getEmailFromToken(token: string): string | null {
  const decoded = decodeToken(token)
  return typeof decoded?.sub === 'string' ? decoded.sub : null
}

export function getRoleFromToken(token: string): string | null {
  const decoded = decodeToken(token)
  return typeof decoded?.role === 'string' ? decoded.role : null
}
