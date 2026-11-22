import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Cross } from 'lucide-react'
import { getGalleryData } from '@/lib/gallery'
import GalleryBrowser from './gallery-browser'
import styles from './gallery.module.css'

export const metadata: Metadata = {
  title: 'أعمالنا | سر التميز',
  description: 'تعرّف على مشاريع تطوير الصيدليات وتنظيم الأقسام والمنتجات لدى سر التميز.',
}

export default async function GalleryPage() {
  const { categories, media } = await getGalleryData()
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="سر التميز — الرئيسية">
          <span className={styles.mark}><Cross size={20} /></span><span><strong>سر التميز</strong><small>لتطوير وإدارة الصيدليات</small></span>
        </Link>
        <Link className={styles.back} href="/"><ArrowRight size={17} /> العودة للرئيسية</Link>
      </header>
      <section className={styles.intro}>
          <span className={styles.kicker}>قبل وبعد — من أرض الواقع</span>
          <h1>كل تفصيل يصنع <span>فرقاً.</span></h1>
          <p>من صور الواقع قبل التطوير إلى تفاصيل الصيدلية بعد ترتيبها — اختر القسم والمرحلة وشاهد الفرق.</p>
      </section>
      <GalleryBrowser categories={categories} media={media} />
      <footer className={styles.footer}><Link href="/">سر التميز</Link><span>خبرة محلية. أثر يدوم.</span></footer>
    </main>
  )
}
