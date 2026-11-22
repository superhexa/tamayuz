import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import SignInForm from './sign-in-form'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role === 'admin') redirect('/admin')
  return <main className={styles.authPage}><SignInForm /></main>
}
