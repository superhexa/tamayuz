'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Cross, LockKeyhole } from 'lucide-react'
import { signIn, signUp } from '@/lib/auth-client'
import styles from '../admin.module.css'

export default function SignInForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [setupToken, setSetupToken] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      if (mode === 'signup') {
        const authorization = await fetch('/api/admin/authorize-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, setupToken }),
        })
        const authorizationResult = await authorization.json().catch(() => ({}))
        if (!authorization.ok) throw new Error(authorizationResult.error || 'تعذر تفويض التسجيل.')
      }
      const result = mode === 'signup'
        ? await signUp.email({ name, email, password })
        : await signIn.email({ email, password })
      if (result.error) throw new Error(result.error.message || 'تعذر تسجيل الدخول. تحقق من بياناتك.')
      setSetupToken('')
      router.replace('/admin')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'حدث خطأ. حاول مرة أخرى.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className={styles.authCard}>
      <Link href="/" className={styles.authBack}><ArrowRight size={16} /> العودة للموقع</Link>
      <div className={styles.authBrand}><span className={styles.authMark}><Cross size={21} /></span><span><strong>سر التميز</strong><small>لوحة إدارة المعرض</small></span></div>
      <span className={styles.authIcon}><LockKeyhole size={20} /></span>
      <h1>{mode === 'signup' ? 'إنشاء حساب المدير' : 'مرحباً بعودتك'}</h1>
      <p>{mode === 'signup' ? 'أدخل البريد المعتمد ومفتاح الإعداد الخاص بمدير الموقع.' : 'سجّل الدخول لإدارة الصور والفيديوهات والأقسام.'}</p>
      <form onSubmit={submit} className={styles.authForm}>
        {mode === 'signup' && <label>الاسم<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} /></label>}
        {mode === 'signup' && <label>مفتاح إعداد المدير<input type="password" autoComplete="off" value={setupToken} onChange={(event) => setSetupToken(event.target.value)} required /></label>}
        <label>البريد الإلكتروني<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>كلمة المرور<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
        {error && <div className={styles.error} role="alert">{error}</div>}
        <button type="submit" disabled={pending}>{pending ? 'جارٍ التحقق…' : mode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button>
      </form>
      <button className={styles.modeSwitch} onClick={() => { setError(''); setMode(mode === 'signin' ? 'signup' : 'signin') }} type="button">{mode === 'signin' ? 'أول مرة؟ أنشئ حساب المدير' : 'لديك حساب؟ تسجيل الدخول'}</button>
      <small className={styles.allowlistNote}>التسجيل يحتاج بريداً معتمداً ومفتاح الإعداد السري.</small>
    </section>
  )
}
