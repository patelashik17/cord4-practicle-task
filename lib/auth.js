import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'payout-mvp-secret-key'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...val] = c.trim().split('=')
        return [key, val.join('=')]
      })
    )
    return cookies['auth_token'] || null
  }

  return null
}

export function requireAuth(request) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export function requireRole(request, roles) {
  const user = requireAuth(request)
  if (!user) return null
  if (!roles.includes(user.role)) return null
  return user
}