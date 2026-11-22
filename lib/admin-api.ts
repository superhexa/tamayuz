import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'

export async function adminOrResponse() {
  const user = await getAdminUser()
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    }
  }
  return { user, response: null }
}

export function validText(value: unknown, max = 240): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max
}

export function validUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
