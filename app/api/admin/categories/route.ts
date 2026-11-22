import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { adminOrResponse, validText } from '@/lib/admin-api'

export async function GET() {
  const { response } = await adminOrResponse()
  if (response) return response
  const result = await pool.query('SELECT id, name, slug, description, "sortOrder" FROM gallery_categories ORDER BY "sortOrder", name')
  return NextResponse.json(result.rows)
}

export async function POST(request: NextRequest) {
  const { user, response } = await adminOrResponse()
  if (response) return response
  const body = await request.json().catch(() => null)
  if (!body || !validText(body.name, 80)) return NextResponse.json({ error: 'Enter a category name up to 80 characters.' }, { status: 400 })
  const slug = (typeof body.slug === 'string' ? body.slug : body.name).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
  if (!slug) return NextResponse.json({ error: 'Choose a valid category name.' }, { status: 400 })
  try {
    const result = await pool.query('INSERT INTO gallery_categories ("userId", name, slug, description, "sortOrder") VALUES ($1, $2, $3, $4, $5) RETURNING id, name, slug, description, "sortOrder"', [user!.id, body.name.trim(), slug, typeof body.description === 'string' ? body.description.slice(0, 300) : '', Number.isInteger(body.sortOrder) ? body.sortOrder : 0])
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === '23505') return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 })
    throw error
  }
}
