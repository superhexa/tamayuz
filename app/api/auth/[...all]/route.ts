import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

const handlers = toNextJsHandler(auth)
export const GET = handlers.GET

export async function POST(request: NextRequest) {
  const isSignup = request.nextUrl.pathname.endsWith('/sign-up/email')
  if (!isSignup) return handlers.POST(request)

  const body = await request.clone().json().catch(() => null)
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json({ message: 'Admin registration requires an approved setup key.' }, { status: 403 })
  }

  const token = request.cookies.get('admin_setup_intent')?.value
  const secret = process.env.BETTER_AUTH_SECRET
  let valid = false
  if (token && secret) {
    const [payload, signature, extra] = token.split('.')
    if (payload && signature && !extra) {
      const expected = createHmac('sha256', secret).update(payload).digest('base64url')
      const supplied = Buffer.from(signature)
      const expectedBuffer = Buffer.from(expected)
      if (supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer)) {
        const [authorizedEmail, expiresAt] = Buffer.from(payload, 'base64url').toString().split('\n')
        valid = authorizedEmail === body.email.trim().toLowerCase() && Number(expiresAt) >= Math.floor(Date.now() / 1000)
      }
    }
  }
  if (!valid) return NextResponse.json({ message: 'Admin registration requires an approved setup key.' }, { status: 403 })
  return handlers.POST(request)
}
