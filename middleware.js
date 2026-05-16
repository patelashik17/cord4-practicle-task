import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'payout-mvp-secret-key'

const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/seed']

async function verifyTokenEdge(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    const keyData = new TextEncoder().encode(JWT_SECRET)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signatureBytes = base64UrlDecode(signatureB64)
    const dataToVerify = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataToVerify)
    if (!isValid) return null

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64))
    const payload = JSON.parse(payloadJson)

    if (payload.exp && Date.now() / 1000 > payload.exp) return null

    return payload
  } catch {
    return null
  }
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await verifyTokenEdge(token)

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
    return response
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-role', user.role)
  requestHeaders.set('x-user-email', user.email)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}