import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { adminOrResponse, validText, validUrl } from '@/lib/admin-api'

const stages = new Set(['single', 'before', 'after'])
const mediaTypes = new Set(['image', 'video'])

function validMedia(body: Record<string, unknown>) {
  return validText(body.title, 140) && typeof body.categoryId === 'string' && /^[0-9a-f-]{36}$/i.test(body.categoryId) && mediaTypes.has(String(body.mediaType)) && validUrl(body.mediaUrl) && stages.has(String(body.stage)) && typeof body.description === 'string' && body.description.length <= 1200 && (body.posterUrl == null || body.posterUrl === '' || validUrl(body.posterUrl)) && (body.pairKey == null || body.pairKey === '' || (typeof body.pairKey === 'string' && body.pairKey.length <= 80))
}

function values(body: Record<string, unknown>) {
  return [body.categoryId, String(body.title).trim(), String(body.description).trim(), body.mediaType, body.mediaUrl, body.posterUrl || null, body.stage, body.pairKey || null, body.isPublished !== false, Number.isInteger(body.sortOrder) ? body.sortOrder : 0]
}

export async function GET() {
  const { response } = await adminOrResponse()
  if (response) return response
  const result = await pool.query('SELECT m.id, m."categoryId", c.name AS "categoryName", c.slug AS "categorySlug", m.title, m.description, m."mediaType", m."mediaUrl", m."posterUrl", m.stage, m."pairKey", m."isPublished", m."sortOrder", m."createdAt" FROM gallery_media m JOIN gallery_categories c ON c.id = m."categoryId" ORDER BY m."sortOrder", m."createdAt" DESC')
  return NextResponse.json(result.rows)
}

export async function POST(request: NextRequest) {
  const { user, response } = await adminOrResponse()
  if (response) return response
  const body = await request.json().catch(() => null)
  if (!body || !validMedia(body)) return NextResponse.json({ error: 'Check the title, category, media URL, and media type.' }, { status: 400 })
  const result = await pool.query('INSERT INTO gallery_media ("userId", "categoryId", title, description, "mediaType", "mediaUrl", "posterUrl", stage, "pairKey", "isPublished", "sortOrder") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [user!.id, ...values(body)])
  return NextResponse.json(result.rows[0], { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const { response } = await adminOrResponse()
  if (response) return response
  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id) || !validMedia(body)) return NextResponse.json({ error: 'Check the media details and try again.' }, { status: 400 })
  const result = await pool.query('UPDATE gallery_media SET "categoryId"=$2, title=$3, description=$4, "mediaType"=$5, "mediaUrl"=$6, "posterUrl"=$7, stage=$8, "pairKey"=$9, "isPublished"=$10, "sortOrder"=$11, "updatedAt"=now() WHERE id=$1 RETURNING *', [body.id, ...values(body)])
  return result.rowCount ? NextResponse.json(result.rows[0]) : NextResponse.json({ error: 'Media item not found.' }, { status: 404 })
}

export async function DELETE(request: NextRequest) {
  const { response } = await adminOrResponse()
  if (response) return response
  const body = await request.json().catch(() => null)
  if (!body || typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) return NextResponse.json({ error: 'Invalid media item.' }, { status: 400 })
  const result = await pool.query('DELETE FROM gallery_media WHERE id=$1', [body.id])
  return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Media item not found.' }, { status: 404 })
}
