import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAuthorizedAdminEmail } from '@/lib/admin-access'

export async function getAdminUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (
    !session?.user ||
    session.user.role !== 'admin' ||
    !(await isAuthorizedAdminEmail(session.user.email))
  ) return null
  return session.user
}

export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/sign-in')
  return user
}
