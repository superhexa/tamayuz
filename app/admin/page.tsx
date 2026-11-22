import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { getGalleryData } from '@/lib/gallery'
import { getAdminMembers, isConfiguredAdminEmail } from '@/lib/admin-access'
import AdminDashboard from './admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/sign-in')
  const [{ categories, media }, admins] = await Promise.all([
    getGalleryData(true),
    getAdminMembers(),
  ])
  return <AdminDashboard initialCategories={categories} initialMedia={media} initialAdmins={admins} canManageAdmins={isConfiguredAdminEmail(user.email)} email={user.email} />
}
