'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpLeft, Check, ImagePlus, LogOut, Pencil, Plus, ShieldCheck, Trash2, Upload, UserPlus, Users, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import type { AdminMember } from '@/lib/admin-access'
import type { GalleryCategory, GalleryMedia } from '@/lib/gallery'
import styles from './admin.module.css'

type Props = { initialCategories: GalleryCategory[]; initialMedia: GalleryMedia[]; initialAdmins: AdminMember[]; canManageAdmins: boolean; email: string }
const emptyItem = { title: '', description: '', categoryId: '', mediaType: 'image' as 'image' | 'video', mediaUrl: '', posterUrl: '', stage: 'single' as 'single' | 'before' | 'after', pairKey: '', isPublished: true, sortOrder: 0 }

export default function AdminDashboard({ initialCategories, initialMedia, initialAdmins, canManageAdmins, email }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [media, setMedia] = useState(initialMedia)
  const [admins, setAdmins] = useState(initialAdmins)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminBusy, setAdminBusy] = useState(false)
  const [item, setItem] = useState(emptyItem)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categoryEdit, setCategoryEdit] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const publishedCount = media.filter((entry) => entry.isPublished).length
  const videoCount = media.filter((entry) => entry.mediaType === 'video').length
  const draftCount = media.length - publishedCount

  async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'تعذر إتمام العملية.')
    return data
  }

  async function refreshData() {
    const [nextMedia, nextCategories] = await Promise.all([request('/api/admin/media'), request('/api/admin/categories')])
    setMedia(nextMedia)
    setCategories(nextCategories)
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!item.mediaUrl) { setError('أضف رابطاً أو ارفع ملفاً قبل الحفظ.'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      await request('/api/admin/media', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify({ ...item, id: editingId }) })
      await refreshData()
      setItem({ ...emptyItem, categoryId: categories[0]?.id ?? '' }); setEditingId(null); setMessage('تم حفظ العنصر بنجاح.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر الحفظ.') }
    finally { setBusy(false) }
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true); setError(''); setMessage('جارٍ رفع الملف…')
    try {
      const form = new FormData(); form.append('file', file)
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'تعذر رفع الملف.')
      setItem((current) => ({ ...current, mediaUrl: data.url, mediaType: data.contentType.startsWith('video/') ? 'video' : 'image' }))
      setMessage('اكتمل الرفع. احفظ العنصر لإضافته إلى المعرض.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر رفع الملف.'); setMessage('') }
    finally { setBusy(false); event.target.value = '' }
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    const existing = categories.find((category) => category.id === categoryEdit)
    try {
      await request(existing ? `/api/admin/categories/${existing.id}` : '/api/admin/categories', {
        method: existing ? 'PATCH' : 'POST',
        body: JSON.stringify({ name: categoryName, slug: existing?.slug, description: categoryDescription, sortOrder: existing?.sortOrder ?? categories.length }),
      })
      await refreshData(); setCategoryName(''); setCategoryDescription(''); setCategoryEdit(null); setMessage('تم حفظ القسم.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حفظ القسم.') }
    finally { setBusy(false) }
  }

  async function deleteCategory(category: GalleryCategory) {
    if (!window.confirm(`حذف قسم «${category.name}»؟`)) return
    setError(''); setMessage('')
    try { await request(`/api/admin/categories/${category.id}`, { method: 'DELETE' }); await refreshData(); setMessage('تم حذف القسم.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حذف القسم.') }
  }

  async function deleteMedia(entry: GalleryMedia) {
    if (!window.confirm(`حذف «${entry.title}» من المعرض؟`)) return
    setError(''); setMessage('')
    try { await request('/api/admin/media', { method: 'DELETE', body: JSON.stringify({ id: entry.id }) }); await refreshData(); setMessage('تم حذف العنصر.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حذف العنصر.') }
  }

  function editMedia(entry: GalleryMedia) {
    setEditingId(entry.id)
    setItem({ title: entry.title, description: entry.description, categoryId: entry.categoryId, mediaType: entry.mediaType, mediaUrl: entry.mediaUrl, posterUrl: entry.posterUrl ?? '', stage: entry.stage, pairKey: entry.pairKey ?? '', isPublished: entry.isPublished, sortOrder: entry.sortOrder })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function addAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdminBusy(true); setError(''); setMessage('')
    try {
      await request('/api/admin/members', { method: 'POST', body: JSON.stringify({ email: newAdminEmail }) })
      setAdmins(await request('/api/admin/members'))
      setNewAdminEmail('')
      setMessage('تمت إضافة المدير. يمكنه إنشاء حسابه باستخدام مفتاح إعداد المدير.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذرت إضافة المدير.') }
    finally { setAdminBusy(false) }
  }

  async function removeAdmin(member: AdminMember) {
    if (!member.managed || member.email.toLowerCase() === email.toLowerCase()) return
    if (!window.confirm(`إزالة صلاحية المدير عن ${member.email}؟`)) return
    setAdminBusy(true); setError(''); setMessage('')
    try {
      await request('/api/admin/members', { method: 'DELETE', body: JSON.stringify({ email: member.email }) })
      setAdmins(await request('/api/admin/members'))
      setMessage('تمت إزالة صلاحية المدير.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذرت إزالة المدير.') }
    finally { setAdminBusy(false) }
  }

  async function logout() { await authClient.signOut(); router.replace('/admin/sign-in'); router.refresh() }

  return (
    <main className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <a href="/" className={styles.brand}><span className={styles.brandMark}>س</span><span><strong>سر التميز</strong><small>إدارة المحتوى</small></span></a>
        <nav aria-label="التنقل في لوحة الإدارة"><a href="#overview" className={styles.navActive}>نظرة عامة</a><a href="#media">الصور والفيديوهات</a><a href="#categories">الأقسام</a>{canManageAdmins && <a href="#admins">مديرو الموقع</a>}<a href="/gallery" target="_blank" rel="noreferrer">المعرض العام <ArrowUpLeft size={15} /></a></nav>
        <div className={styles.account}><span className={styles.avatar}>{email.slice(0, 1).toUpperCase()}</span><span className={styles.accountCopy}><strong>مدير المعرض</strong><small>{email}</small></span><button onClick={logout} aria-label="تسجيل الخروج"><LogOut size={17} /></button></div>
      </aside>
      <section className={styles.workspace}>
        <header className={styles.topbar}><div><span className={styles.breadcrumb}>لوحة الإدارة <span>/</span> المحتوى</span><h1>مساحة عملك</h1></div><a className={styles.viewButton} href="/gallery" target="_blank" rel="noreferrer">عرض المعرض <ArrowUpLeft size={16} /></a></header>
        <div className={styles.stats} id="overview"><article><span>عناصر المعرض</span><strong>{media.length}</strong><small>الصور والفيديوهات</small></article><article><span>منشور</span><strong>{publishedCount}</strong><small>ظاهر للجمهور</small></article><article><span>فيديو</span><strong>{videoCount}</strong><small>من مكتبة المحتوى</small></article><article><span>مسودة</span><strong>{draftCount}</strong><small>غير منشور</small></article></div>
        {(error || message) && <div className={error ? styles.alertError : styles.alertSuccess} role={error ? 'alert' : 'status'}>{error || message}<button onClick={() => { setError(''); setMessage('') }} aria-label="إغلاق"><X size={15} /></button></div>}
        <div className={styles.editorGrid} id="media">
          <section className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>{editingId ? 'تحديث المحتوى' : 'مكتبة المعرض'}</span><h2>{editingId ? 'تعديل عنصر' : 'إضافة إلى المعرض'}</h2></div><span className={styles.headingIcon}><ImagePlus size={19} /></span></div>
            <form className={styles.form} onSubmit={saveItem}>
              <label>عنوان العنصر<input value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} required maxLength={140} placeholder="مثال: تطوير قسم العناية" /></label>
              <label>القسم<select value={item.categoryId || categories[0]?.id || ''} onChange={(e) => setItem({ ...item, categoryId: e.target.value })} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label>وصف مختصر<textarea value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} maxLength={1200} rows={3} /></label>
              <label>رابط الملف<input type="url" value={item.mediaUrl} onChange={(e) => setItem({ ...item, mediaUrl: e.target.value })} placeholder="https://…" /></label>
              <label className={styles.uploadButton}><Upload size={16} /> رفع صورة أو فيديو من جهازك<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" onChange={uploadFile} disabled={busy} /></label>
              {item.mediaUrl && <div className={styles.uploaded}><Check size={15} /> الملف جاهز للحفظ</div>}
              <div className={styles.twoCols}><label>نوع الملف<select value={item.mediaType} onChange={(e) => setItem({ ...item, mediaType: e.target.value as 'image' | 'video' })}><option value="image">صورة</option><option value="video">فيديو</option></select></label><label>الظهور<select value={item.isPublished ? 'published' : 'draft'} onChange={(e) => setItem({ ...item, isPublished: e.target.value === 'published' })}><option value="published">منشور</option><option value="draft">مسودة</option></select></label></div>
              {item.mediaType === 'video' && <label>صورة غلاف (اختياري)<input type="url" value={item.posterUrl} onChange={(e) => setItem({ ...item, posterUrl: e.target.value })} placeholder="https://…" /></label>}
              <div className={styles.twoCols}><label>معالجة الصورة<select value={item.stage} onChange={(e) => setItem({ ...item, stage: e.target.value as typeof item.stage })}><option value="single">عادية</option><option value="before">قبل</option><option value="after">بعد</option></select></label><label>معرّف المقارنة<input value={item.pairKey} onChange={(e) => setItem({ ...item, pairKey: e.target.value })} maxLength={80} placeholder="اختياري" /></label></div>
              <div className={styles.formActions}><button className={styles.primaryButton} type="submit" disabled={busy || !categories.length}>{busy ? 'جارٍ الحفظ…' : editingId ? 'حفظ التعديلات' : 'إضافة إلى المعرض'}</button>{editingId && <button type="button" className={styles.cancelButton} onClick={() => { setEditingId(null); setItem({ ...emptyItem, categoryId: categories[0]?.id ?? '' }) }}>إلغاء</button>}</div>
            </form>
          </section>
          <section className={styles.panel} id="categories"><div className={styles.panelHeading}><div><span className={styles.eyebrow}>تنظيم المحتوى</span><h2>أقسام المعرض</h2></div><span className={styles.headingIcon}><Plus size={19} /></span></div>
            <form className={styles.categoryForm} onSubmit={saveCategory}><label>اسم القسم<input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required maxLength={80} placeholder="مثال: المكملات الغذائية" /></label><label>وصف (اختياري)<input value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} maxLength={300} /></label><div className={styles.formActions}><button className={styles.primaryButton} disabled={busy}>{categoryEdit ? 'تحديث القسم' : 'إضافة قسم'}</button>{categoryEdit && <button type="button" className={styles.cancelButton} onClick={() => { setCategoryEdit(null); setCategoryName(''); setCategoryDescription('') }}>إلغاء</button>}</div></form>
            <ul className={styles.categoryList}>{categories.map((category) => <li key={category.id}><span><strong>{category.name}</strong><small>{media.filter((entry) => entry.categoryId === category.id).length} عناصر</small></span><button aria-label={`تعديل ${category.name}`} onClick={() => { setCategoryEdit(category.id); setCategoryName(category.name); setCategoryDescription(category.description ?? '') }}><Pencil size={15} /></button><button aria-label={`حذف ${category.name}`} onClick={() => deleteCategory(category)}><Trash2 size={15} /></button></li>)}</ul>
          </section>
        </div>
        <section className={styles.panel + ' ' + styles.library}>
          <div className={styles.panelHeading}><div><span className={styles.eyebrow}>المحتوى المحفوظ</span><h2>كل العناصر <span className={styles.count}>{media.length}</span></h2></div></div>
          {media.length ? <div className={styles.mediaList}>{media.map((entry) => <article key={entry.id} className={styles.mediaRow}><div className={styles.thumb}>{entry.mediaType === 'video' ? <video src={entry.mediaUrl} muted preload="metadata" /> : <img src={entry.mediaUrl} alt="" loading="lazy" />}</div><div className={styles.mediaInfo}><strong>{entry.title}</strong><small>{entry.categoryName} · {entry.mediaType === 'video' ? 'فيديو' : 'صورة'} · {entry.stage === 'single' ? 'عادي' : entry.stage === 'before' ? 'قبل' : 'بعد'}</small></div><span className={entry.isPublished ? styles.publishedBadge : styles.draftBadge}>{entry.isPublished ? 'منشور' : 'مسودة'}</span><div className={styles.rowActions}><button onClick={() => editMedia(entry)} aria-label={`تعديل ${entry.title}`}><Pencil size={16} /></button><button onClick={() => deleteMedia(entry)} aria-label={`حذف ${entry.title}`}><Trash2 size={16} /></button></div></article>)}</div> : <div className={styles.empty}><ImagePlus size={24} /><span>لا توجد عناصر بعد. أضف أول صورة أو فيديو من النموذج أعلاه.</span></div>}
        </section>
        {canManageAdmins && <section className={styles.panel + ' ' + styles.adminPanel} id="admins">
          <div className={styles.panelHeading}>
            <div><span className={styles.eyebrow}>الصلاحيات والوصول</span><h2>مديرو الموقع <span className={styles.count}>{admins.length}</span></h2></div>
            <span className={styles.headingIcon}><Users size={19} /></span>
          </div>
          <form className={styles.adminInviteForm} onSubmit={addAdmin}>
            <label htmlFor="new-admin-email">إضافة مدير جديد</label>
            <div className={styles.adminInviteControls}>
              <input id="new-admin-email" type="email" dir="ltr" autoComplete="email" value={newAdminEmail} onChange={(event) => setNewAdminEmail(event.target.value)} placeholder="admin@example.com" required maxLength={254} />
              <button className={styles.primaryButton} type="submit" disabled={adminBusy}><UserPlus size={16} />{adminBusy ? 'جارٍ التحديث…' : 'إضافة مدير'}</button>
            </div>
            <p>بعد الإضافة، يستطيع المدير إنشاء حسابه من صفحة الدخول باستخدام مفتاح إعداد المدير السري.</p>
          </form>
          <div className={styles.adminList}>
            {admins.map((member) => (
              <article className={styles.adminRow} key={member.email}>
                <span className={styles.adminAvatar}><ShieldCheck size={16} /></span>
                <span className={styles.adminIdentity}><strong dir="ltr">{member.email}</strong><small>{member.managed ? `أُضيف في ${member.createdAt?.slice(0, 10) ?? 'حديثاً'}` : 'مُعرّف في إعدادات الموقع'}</small></span>
                <span className={member.managed ? styles.adminRole : styles.adminRolePrimary}>{member.managed ? 'مدير' : 'أساسي'}</span>
                {member.managed && member.email.toLowerCase() !== email.toLowerCase() && <button className={styles.removeAdmin} type="button" disabled={adminBusy} onClick={() => removeAdmin(member)} aria-label={`إزالة صلاحية ${member.email}`}><Trash2 size={16} /></button>}
              </article>
            ))}
            {!admins.length && <p className={styles.noAdmins}>لا توجد حسابات مديرة مضافة حتى الآن.</p>}
          </div>
        </section>}
        <footer className={styles.dashFooter}>سر التميز <span>•</span> إدارة معرض الأعمال</footer>
      </section>
    </main>
  )
}
