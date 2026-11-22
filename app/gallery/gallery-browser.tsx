'use client'

import { useMemo, useState } from 'react'
import { Play, X } from 'lucide-react'
import type { GalleryCategory, GalleryMedia } from '@/lib/gallery'
import styles from './gallery.module.css'

export default function GalleryBrowser({ categories, media }: { categories: GalleryCategory[]; media: GalleryMedia[] }) {
  const [active, setActive] = useState('all')
  const [stageFilter, setStageFilter] = useState<'all' | 'before' | 'after'>('all')
  const [selected, setSelected] = useState<GalleryMedia | null>(null)
  const shown = useMemo(() => media.filter((item) =>
    (active === 'all' || item.categoryId === active) &&
    (stageFilter === 'all' || item.stage === stageFilter),
  ), [active, media, stageFilter])

  return (
    <>
      <div className={styles.filterStack}>
        <div className={styles.filters} role="group" aria-label="تصفية الأعمال حسب القسم">
          <button className={active === 'all' ? styles.activeFilter : ''} onClick={() => setActive('all')}>الكل <span>{media.length}</span></button>
          {categories.map((category) => <button key={category.id} className={active === category.id ? styles.activeFilter : ''} onClick={() => setActive(category.id)}>{category.name}</button>)}
        </div>
        <div className={styles.stageFilters} role="group" aria-label="تصفية الأعمال حسب مرحلة المشروع">
          {(['all', 'before', 'after'] as const).map((stage) => <button key={stage} className={`${stageFilter === stage ? styles.activeStage : ''} ${stage === 'before' ? styles.beforeStage : stage === 'after' ? styles.afterStage : ''}`} onClick={() => setStageFilter(stage)}>{stage === 'all' ? `كل المراحل · ${media.length}` : stage === 'before' ? `قبل التطوير · ${media.filter((item) => item.stage === 'before').length}` : `بعد التطوير · ${media.filter((item) => item.stage === 'after').length}`}</button>)}
        </div>
      </div>
      {shown.length === 0 ? <div className={styles.empty}>لا توجد أعمال منشورة في هذا القسم بعد.</div> : (
        <div className={styles.grid}>
          {shown.map((item) => (
            <button className={styles.card} key={item.id} onClick={() => setSelected(item)} aria-label={`عرض ${item.title}`}>
              <span className={styles.mediaFrame}>
                {item.mediaType === 'video' ? <video src={item.mediaUrl} poster={item.posterUrl ?? undefined} preload="metadata" muted playsInline /> : <img src={item.mediaUrl} alt={item.title} loading="lazy" />}
                {item.mediaType === 'video' && <span className={styles.play}><Play size={17} fill="currentColor" /></span>}
                {item.stage !== 'single' && <span className={`${styles.stage} ${item.stage === 'before' ? styles.before : styles.after}`}>{item.stage === 'before' ? 'قبل' : 'بعد'}</span>}
              </span>
              <span className={styles.caption}><span><small>{item.categoryName}</small><strong>{item.title}</strong></span><span className={styles.openMark}>↗</span></span>
            </button>
          ))}
        </div>
      )}
      {selected && <div className={styles.lightbox} role="presentation" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-label={selected.title} onClick={(event) => event.stopPropagation()}><button className={styles.close} onClick={() => setSelected(null)} aria-label="إغلاق"><X size={20} /></button>{selected.mediaType === 'video' ? <video src={selected.mediaUrl} controls autoPlay playsInline /> : <img src={selected.mediaUrl} alt={selected.title} />}<div><strong>{selected.title}</strong><p>{selected.description}</p></div></section></div>}
    </>
  )
}
