import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { getGalleryData } from '@/lib/gallery'
import AdminDashboard from './admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/sign-in')
  const { categories, media } = await getGalleryData(true)
  return <AdminDashboard initialCategories={categories} initialMedia={media} email={user.email} />
}
