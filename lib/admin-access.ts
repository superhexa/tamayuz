import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminMembers } from '@/lib/db/schema'

const configuredAdminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
)

export type AdminMember = {
  email: string
  createdAt: string | null
  managed: boolean
}

export function isConfiguredAdminEmail(email: string) {
  return configuredAdminEmails.has(email.trim().toLowerCase())
}

export async function isAuthorizedAdminEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return false
  if (configuredAdminEmails.has(normalizedEmail)) return true

  const [member] = await db
    .select({ email: adminMembers.email })
    .from(adminMembers)
    .where(eq(adminMembers.email, normalizedEmail))
    .limit(1)

  return Boolean(member)
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  const [managedMembers] = await Promise.all([
    db.select({ email: adminMembers.email, createdAt: adminMembers.createdAt })
      .from(adminMembers)
      .orderBy(asc(adminMembers.email)),
  ])

  const configured = [...configuredAdminEmails].map((email) => ({
    email,
    createdAt: null,
    managed: false,
  }))
  const managed = managedMembers
    .filter((member) => !configuredAdminEmails.has(member.email))
    .map((member) => ({
      email: member.email,
      createdAt: member.createdAt.toISOString(),
      managed: true,
    }))

  return [...configured, ...managed].sort((first, second) => first.email.localeCompare(second.email))
}
