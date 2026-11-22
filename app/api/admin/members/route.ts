import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminMembers } from '@/lib/db/schema'
import { getAdminMembers, isConfiguredAdminEmail } from '@/lib/admin-access'
import { adminOrResponse, validText } from '@/lib/admin-api'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET() {
  const access = await adminOrResponse()
  if (access.response) return access.response
  if (!isConfiguredAdminEmail(access.user.email)) {
    return NextResponse.json({ error: 'Only the primary site administrators can manage administrator access.' }, { status: 403 })
  }
  return NextResponse.json(await getAdminMembers())
}

export async function POST(request: NextRequest) {
  const access = await adminOrResponse()
  if (access.response) return access.response
  if (!isConfiguredAdminEmail(access.user.email)) {
    return NextResponse.json({ error: 'Only the primary site administrators can manage administrator access.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!validText(email, 254) || !emailPattern.test(email)) {
    return NextResponse.json({ error: 'أدخل بريداً إلكترونياً صالحاً.' }, { status: 400 })
  }

  const [member] = await db
    .insert(adminMembers)
    .values({ email, createdBy: access.user.id })
    .onConflictDoNothing()
    .returning({ email: adminMembers.email })

  if (!member) {
    return NextResponse.json({ error: 'هذا البريد موجود ضمن قائمة المديرين مسبقاً.' }, { status: 409 })
  }

  return NextResponse.json({ email: member.email }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const access = await adminOrResponse()
  if (access.response) return access.response
  if (!isConfiguredAdminEmail(access.user.email)) {
    return NextResponse.json({ error: 'Only the primary site administrators can manage administrator access.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!validText(email, 254) || !emailPattern.test(email)) {
    return NextResponse.json({ error: 'البريد الإلكتروني غير صالح.' }, { status: 400 })
  }
  if (email === access.user.email.trim().toLowerCase()) {
    return NextResponse.json({ error: 'لا يمكنك إزالة صلاحية حسابك الحالي.' }, { status: 400 })
  }
  if (isConfiguredAdminEmail(email)) {
    return NextResponse.json({ error: 'لا يمكن إزالة المديرين الأساسيين من لوحة الإدارة.' }, { status: 403 })
  }

  const [removed] = await db
    .delete(adminMembers)
    .where(eq(adminMembers.email, email))
    .returning({ email: adminMembers.email })

  if (!removed) {
    return NextResponse.json({ error: 'لم يتم العثور على هذا المدير.' }, { status: 404 })
  }

  return NextResponse.json({ email: removed.email })
}
