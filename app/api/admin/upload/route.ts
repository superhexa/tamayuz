import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { adminOrResponse } from '@/lib/admin-api'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'])
const maxSize = 100 * 1024 * 1024

export async function POST(request: NextRequest) {
  const { user, response } = await adminOrResponse()
  if (response) return response
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image or video to upload.' }, { status: 400 })
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: 'Use a JPEG, PNG, WebP, AVIF, MP4, or WebM file.' }, { status: 415 })
  if (file.size > maxSize) return NextResponse.json({ error: 'Files must be smaller than 100 MB.' }, { status: 413 })
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin'
  const blob = await put(`gallery/${user!.id}/${randomUUID()}.${extension}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
  })
  return NextResponse.json({ url: blob.url, contentType: file.type, pathname: blob.pathname }, { status: 201 })
}
