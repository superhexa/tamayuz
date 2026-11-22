import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { adminOrResponse, validText } from '@/lib/admin-api'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response } = await adminOrResponse()
  if (response) return response
  const { id } = await context.params
  const body = await request.json().catch(() => null)
  if (!body || !validText(body.name, 80)) return NextResponse.json({ error: 'Enter a category name up to 80 characters.' }, { status: 400 })
  const slug = (typeof body.slug === 'string' ? body.slug : body.name).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
  try {
    const result = await pool.query('UPDATE gallery_categories SET name = $2, slug = $3, description = $4, "sortOrder" = $5, "updatedAt" = now() WHERE id = $1 RETURNING id, name, slug, description, "sortOrder"', [id, body.name.trim(), slug, typeof body.description === 'string' ? body.description.slice(0, 300) : '', Number.isInteger(body.sortOrder) ? body.sortOrder : 0])
    return result.rowCount ? NextResponse.json(result.rows[0]) : NextResponse.json({ error: 'Category not found.' }, { status: 404 })
  } catch (error) {
    if ((error as { code?: string }).code === '23505') return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 })
    throw error
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response } = await adminOrResponse()
  if (response) return response
  const { id } = await context.params
  try {
    const result = await pool.query('DELETE FROM gallery_categories WHERE id = $1', [id])
    if (!result.rowCount) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if ((error as { code?: string }).code === '23503') return NextResponse.json({ error: 'Move or delete this category’s media before removing it.' }, { status: 409 })
    throw error
  }
}
