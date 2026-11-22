import { pool } from '@/lib/db'

export type GalleryCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
}

export type GalleryMedia = {
  id: string
  categoryId: string
  categoryName: string
  categorySlug: string
  title: string
  description: string
  mediaType: 'image' | 'video'
  mediaUrl: string
  posterUrl: string | null
  stage: 'single' | 'before' | 'after'
  pairKey: string | null
  isPublished: boolean
  sortOrder: number
  createdAt: string
}

export async function getGalleryData(includeUnpublished = false) {
  const [categories, media] = await Promise.all([
    pool.query<GalleryCategory>(
      'SELECT id, name, slug, description, "sortOrder" FROM gallery_categories ORDER BY "sortOrder", name',
    ),
    pool.query<GalleryMedia>(
      `SELECT m.id, m."categoryId", c.name AS "categoryName", c.slug AS "categorySlug", m.title, m.description, m."mediaType", m."mediaUrl", m."posterUrl", m.stage, m."pairKey", m."isPublished", m."sortOrder", m."createdAt"::text AS "createdAt"
       FROM gallery_media m JOIN gallery_categories c ON c.id = m."categoryId"
       ${includeUnpublished ? '' : 'WHERE m."isPublished" = true'}
       ORDER BY m."sortOrder", m."createdAt" DESC`,
    ),
  ])
  return { categories: categories.rows, media: media.rows }
}
