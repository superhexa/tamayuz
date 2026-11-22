import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminEmail } from '@/lib/admin-access'

function matchesSecret(candidate: string, secret: string) {
  const candidateBuffer = Buffer.from(candidate)
  const secretBuffer = Buffer.from(secret)
  return candidateBuffer.length === secretBuffer.length && timingSafeEqual(candidateBuffer, secretBuffer)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const setupToken = typeof body?.setupToken === 'string' ? body.setupToken : ''
  const configuredToken = process.env.ADMIN_SETUP_TOKEN
  const signingSecret = process.env.BETTER_AUTH_SECRET

  if (!configuredToken || !signingSecret) {
    return NextResponse.json({ error: 'Admin account setup is not configured yet.' }, { status: 503 })
  }
  if (!email || !(await isAuthorizedAdminEmail(email)) || !matchesSecret(setupToken, configuredToken)) {
    return NextResponse.json({ error: 'The email or setup key is not authorized.' }, { status: 403 })
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 300
  const payload = Buffer.from(`${email}\n${expiresAt}`).toString('base64url')
  const signature = createHmac('sha256', signingSecret).update(payload).digest('base64url')
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_setup_intent', `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 300,
  })
  return response
}
