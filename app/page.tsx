'use client'

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { ArrowLeft, ArrowUpLeft, BadgeCheck, Boxes, BriefcaseBusiness, Check, Cross, HeartPulse, Layers3, Menu, MessageCircle, PackageCheck, Palette, Phone, ShieldCheck, Sparkles, Stethoscope, Store, UsersRound, X } from 'lucide-react'

const images = [
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5CC5E2B4-B8CD-4477-9471-C5CCE7F2E5DD-SmO9Noz6wYVJcPIz7FMQt8tl0FbMm3.jpeg', alt: 'تنسيق وترتيب رفوف مستحضرات العناية في إحدى الصيدليات', className: 'work-photo work-photo-tall' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41E275BE-CB4F-421A-BCC3-848A7CF83C30-CeeOf3VBQOHkX5NzcidbY6cI47pFIv.jpeg', alt: 'تنظيم منتجات الأطفال على رفوف الصيدلية', className: 'work-photo' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/A9623FB4-A37F-4B56-BBDC-FBC47BB16284-v140nndaSuyXJ1OcGMzONkd5eyEIKr.jpeg', alt: 'عرض منتجات صيدلية PHARMAC بعد التنظيم', className: 'work-photo' },
  { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/703A244D-EEE2-48F6-B22C-6803EED0B65A-NE7kC821I1dCBOblsxWjWpDzs9Pqzf.jpeg', alt: 'مقارنة توضح تحسين ترتيب أرفف الصيدلية', className: 'work-photo' },
]

// Real pharmacy photos reused for the services ledger preview (6 unique shots, cycled across the 10 services)
const servicePhotos = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5CC5E2B4-B8CD-4477-9471-C5CCE7F2E5DD-SmO9Noz6wYVJcPIz7FMQt8tl0FbMm3.jpeg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41E275BE-CB4F-421A-BCC3-848A7CF83C30-CeeOf3VBQOHkX5NzcidbY6cI47pFIv.jpeg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/703A244D-EEE2-48F6-B22C-6803EED0B65A-NE7kC821I1dCBOblsxWjWpDzs9Pqzf.jpeg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/950679A6-98AA-47E4-88ED-F07D446B607F-RhTnTJu5SN1NPHlozGAua574YIjqIV.jpeg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1B3DBF73-AC26-4654-9627-9FAE61ADC0BB-KmZWdH3sw92PUdOM3JAI1TnQHoaziY.jpeg',
]
const servicePhoto = (i: number) => servicePhotos[i % servicePhotos.length]
const services = [
  { icon: Store, ar: 'تنسيق الفروع', en: 'Branch coordination', copy: 'تنسيق متكامل يضمن تجربة موحّدة ومريحة في كل فرع.', copyEn: 'Consistent, seamless experiences across every branch.' },
  { icon: Boxes, ar: 'جرد وتنظيم المخزون', en: 'Inventory management', copy: 'إدارة دقيقة للمخزون تقلّل الهدر وتدعم نمو المبيعات.', copyEn: 'Precise inventory control that reduces waste and supports growth.' },
  { icon: UsersRound, ar: 'تدريب الكادر البشري', en: 'Team training', copy: 'نطوّر مهارات فريقك ليقدم خدمة استثنائية بثقة.', copyEn: 'We equip your team to deliver exceptional service with confidence.' },
  { icon: Layers3, ar: 'تطوير السلاسل', en: 'Chain development', copy: 'خطط تشغيل وتوسّع عملية تناسب طموح علامتك.', copyEn: 'Practical operating and expansion plans for your ambition.' },
  { icon: Palette, ar: 'التصميم والديكور', en: 'Design & interiors', copy: 'مساحات صيدلانية عصرية تجمع بين الجمال والوظيفة.', copyEn: 'Contemporary pharmacy spaces that balance beauty and function.' },
  { icon: Sparkles, ar: 'الاستشارات والتطوير', en: 'Consulting & growth', copy: 'رؤية واضحة وقرارات مدروسة لخطوتك القادمة.', copyEn: 'Clear direction and informed decisions for what comes next.' },
  { icon: MessageCircle, ar: 'التسويق والدعاية', en: 'Marketing & advertising', copy: 'نصنع حضوراً مميزاً يقرّب صيدليتك من مجتمعها.', copyEn: 'Distinctive campaigns that bring your pharmacy closer to its community.' },
  { icon: PackageCheck, ar: 'مستحضرات ومستلزمات', en: 'Beauty & medical supplies', copy: 'اختيارات مدروسة من المستحضرات والمستلزمات الطبية.', copyEn: 'Thoughtful selections of beauty products and medical supplies.' },
  { icon: HeartPulse, ar: 'الفعاليات الطبية', en: 'Medical events', copy: 'فعاليات تثقيفية تبني الثقة وتعزّز التواصل.', copyEn: 'Educational events that build trust and meaningful connections.' },
  { icon: ShieldCheck, ar: 'متابعة الجودة', en: 'Quality assurance', copy: 'معايير متابعة مستمرة تحافظ على أفضل مستوى للخدمة.', copyEn: 'Ongoing standards that keep your service at its best.' },
]

export default function HomePage() {
  const [english, setEnglish] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rtl = !english
  const t = (ar: string, en: string) => english ? en : ar

  // Services ledger: scroll-reveal + cursor-chasing photo preview + tap accordion
  const [openService, setOpenService] = useState(0)
  const [activeService, setActiveService] = useState<number | null>(null)
  const [revealedRows, setRevealedRows] = useState<ReadonlySet<number>>(new Set())
  const ledgerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewTarget = useRef({ x: -9999, y: -9999 })
  const previewCurrent = useRef({ x: -9999, y: -9999 })
  useEffect(() => {
    const ledger = ledgerRef.current
    if (!ledger) return
    const rows = Array.from(ledger.querySelectorAll<HTMLElement>('.ledger-row'))
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealedRows(new Set(rows.map((_, i) => i)))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = rows.indexOf(entry.target as HTMLElement)
          if (idx >= 0) setRevealedRows((prev) => { const next = new Set(prev); next.add(idx); return next })
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    rows.forEach((row) => io.observe(row))
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const tick = () => {
      previewCurrent.current.x += (previewTarget.current.x - previewCurrent.current.x) * 0.14
      previewCurrent.current.y += (previewTarget.current.y - previewCurrent.current.y) * 0.14
      const dx = previewTarget.current.x - previewCurrent.current.x
      const el = previewRef.current
      if (el) {
        // Preview floats above the cursor, clamped inside the viewport
        const w = el.offsetWidth || 270, h = el.offsetHeight || 340
        const left = Math.max(8, Math.min(window.innerWidth - w - 8, previewCurrent.current.x - w / 2))
        const top = Math.max(12, previewCurrent.current.y - h - 14)
        el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${Math.max(-7, Math.min(7, dx * 0.05))}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const handleLedgerMove = (e: ReactMouseEvent<HTMLElement>) => {
    previewTarget.current = { x: e.clientX, y: e.clientY }
  }

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="site-shell">
      <div className="topline"><span><span className="live-dot" />{t('شريكك في تطوير الصيدليات في الأردن', 'Your partner in pharmacy growth across Jordan')}</span><a href="tel:0790967743"><Phone size={13} /> 079 096 7743</a></div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label={t('سر التميز — الرئيسية', 'Sar Al Tamayoz — Home')}>
          <span className="brand-mark"><Cross size={23} strokeWidth={2.4} /></span><span className="brand-copy"><strong>{t('سر التميز', 'SAR AL TAMAYOZ')}</strong><small>{t('لتطوير وإدارة الصيدليات', 'PHARMACY GROWTH & MANAGEMENT')}</small></span>
        </a>
        <nav id="primary-navigation" className={`nav-links ${menuOpen ? 'nav-open' : ''}`} aria-label={t('التنقل الرئيسي', 'Main navigation')}>
          <a href="#about" onClick={() => setMenuOpen(false)}>{t('من نحن', 'About')}</a><a href="#services" onClick={() => setMenuOpen(false)}>{t('خدماتنا', 'Services')}</a><a href="#work" onClick={() => setMenuOpen(false)}>{t('أعمالنا', 'Our work')}</a><a href="#contact" onClick={() => setMenuOpen(false)}>{t('تواصل معنا', 'Contact')}</a>
        </nav>
        <div className="header-actions"><button className="lang-toggle" onClick={() => setEnglish(!english)} aria-label={t('Switch to English', 'التبديل إلى العربية')}><span className={!english ? 'lang-active' : ''}>ع</span><span className={english ? 'lang-active' : ''}>EN</span></button><a className="header-cta" href="https://wa.me/962790967743" target="_blank" rel="noreferrer">{t('ابدأ محادثة', 'Let’s talk')}<ArrowUpLeft size={16} /></a><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? t('إغلاق القائمة', 'Close menu') : t('فتح القائمة', 'Open menu')}>{menuOpen ? <X /> : <Menu />}</button></div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-icon"><Stethoscope size={15} /></span>{t('خبرة صيدلانية. رؤية تجارية.', 'Pharmacy expertise. A business vision.')}</div>
          <h1>{t('صيدليتك تستحق\nأن تكون', 'Your pharmacy\ndeserves to be')}{' '}<span>{t('الأفضل.', 'exceptional.')}</span></h1>
          <p>{t('نطوّر الصيدليات وندير تفاصيلها — من ترتيب الرفوف إلى تطوير السلاسل — لتعمل بكفاءة أكبر وتنمو بثقة.', 'We develop pharmacies and manage every detail — from smarter shelves to stronger chains — so they operate better and grow with confidence.')}</p>
          <div className="hero-actions"><a href="https://wa.me/962790967743" target="_blank" rel="noreferrer" className="button-primary">{t('خلّينا نطوّر صيدليتك', 'Let’s grow your pharmacy')}<ArrowUpLeft size={18} /></a><a className="text-link" href="#services">{t('اكتشف خدماتنا', 'Explore our services')}<ArrowLeft size={16} /></a></div>
          <div className="hero-proof"><div className="proof-avatars"><span>س</span><span>ص</span><span>ن</span></div><div><strong>{t('معك في كل خطوة', 'By your side, every step')}</strong><small>{t('من التخطيط إلى التميّز', 'From planning to progress')}</small></div><div className="proof-divider"/><div className="proof-check"><BadgeCheck size={19} /></div><div><strong>{t('خبرة محلية', 'Local expertise')}</strong><small>{t('نفهم السوق الأردني', 'We know the Jordanian market')}</small></div></div>
        </div>
        <div className="hero-visual"><div className="hero-image-wrap"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/950679A6-98AA-47E4-88ED-F07D446B607F-RhTnTJu5SN1NPHlozGAua574YIjqIV.jpeg" alt={t('صيدلية مرتبة بعناية ضمن مشاريع تطوير سر التميز', 'A thoughtfully organized pharmacy from a Sar Al Tamayoz development project')} /><div className="image-shade"/><div className="hero-image-label"><span className="label-plus"><Cross size={17} /></span><span><strong>{t('نحو صيدلية أكثر تميّزاً', 'A more exceptional pharmacy')}</strong><small>{t('معاً نصنع الفرق', 'Together, we make the difference')}</small></span><ArrowUpLeft size={18} /></div></div><div className="floating-note"><span className="note-icon"><Sparkles size={19} /></span><span><strong>{t('كل تفصيل يصنع فرقاً', 'Every detail makes a difference')}</strong><small>{t('نرتّب اليوم لنكبر غداً', 'Better organized. Ready to grow.')}</small></span></div><div className="hero-orbit"/></div>
        <div className="hero-index"><span>01</span><i/><span>03</span></div>
      </section>

      <section className="trust-strip"><div className="trust-intro">{t('نعرف ما تحتاجه صيدليتك', 'We understand what your pharmacy needs')}</div><div><Cross size={19}/><span>{t('رعاية صحية', 'Healthcare')}</span></div><div><BriefcaseBusiness size={19}/><span>{t('إدارة ذكية', 'Smart management')}</span></div><div><Sparkles size={19}/><span>{t('نمو مستدام', 'Sustainable growth')}</span></div><div className="trust-country"><span className="jordan-dot">✦</span>{t('من الأردن، لكل الأردن', 'From Jordan, for Jordan')}</div></section>

      <section className="about section-pad" id="about"><div className="about-visual"><div className="about-photo-main"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5CC5E2B4-B8CD-4477-9471-C5CCE7F2E5DD-SmO9Noz6wYVJcPIz7FMQt8tl0FbMm3.jpeg" alt={t('تنسيق وترتيب رفوف مستحضرات العناية في إحدى الصيدليات', 'Carefully arranged pharmacy skincare shelves')} /></div><div className="about-photo-small"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1B3DBF73-AC26-4654-9627-9FAE61ADC0BB-KmZWdH3sw92PUdOM3JAI1TnQHoaziY.jpeg" alt={t('تنظيم منتجات العناية في صيدلية', 'Organized personal care products in a pharmacy')} /></div><div className="about-stamp"><Cross size={17}/><span>{t('شريكك<br/>للتميّز'.replace('<br/>',' '), 'YOUR PARTNER\nIN GROWTH')}</span></div></div><div className="about-copy"><div className="section-kicker">{t('عن سر التميز', 'ABOUT SAR AL TAMAYOZ')}</div><h2>{t('لسنا مجرد استشاريين.\nنحن', 'More than consultants.\nWe are your')}{' '}<span>{t('شركاء نجاح.', 'growth partners.')}</span></h2><p>{t('سر التميز شركة أردنية متخصصة في تطوير وإدارة الصيدليات. نعمل جنباً إلى جنب مع أصحاب الصيدليات لنحوّل التحديات اليومية إلى فرص حقيقية للنمو والتميّز.', 'Sar Al Tamayoz is a Jordanian pharmacy development and management company. We work alongside pharmacy owners to turn everyday challenges into real opportunities for growth.')}</p><div className="about-points"><div><span className="point-check"><Check size={14}/></span>{t('حلول مصممة حسب احتياجك', 'Solutions tailored to your needs')}</div><div><span className="point-check"><Check size={14}/></span>{t('متابعة عملية على أرض الواقع', 'Hands-on, practical follow-through')}</div><div><span className="point-check"><Check size={14}/></span>{t('شريك يفهم السوق المحلي', 'A partner who knows the local market')}</div></div><div className="founder"><div className="founder-monogram">أ</div><div><strong>{t('أحمد التميمي', 'Ahmad Al-Tamimi')}</strong><small>{t('المالك والمسؤول الرئيسي', 'Owner & Managing Director')}</small></div><a href="tel:0790967743" aria-label={t('اتصل بأحمد التميمي', 'Call Ahmad Al-Tamimi')}><Phone size={17}/></a></div></div></section>

      <section className="services-section section-pad" id="services">
        <div className="section-heading"><div><div className="section-kicker">{t('حلول متكاملة لصيدليتك', 'COMPLETE PHARMACY SOLUTIONS')}</div><h2>{t('كل ما تحتاجه،', 'Everything you need,')}{' '}<span>{t('في مكان واحد.', 'all in one place.')}</span></h2></div><p>{t('من التفاصيل اليومية إلى الرؤية بعيدة المدى — نساعد صيدليتك على العمل بشكل أفضل.', 'From everyday details to the bigger picture, we help your pharmacy work better.')}</p></div>
        <p className="ledger-hint"><i aria-hidden="true" />{t('مرّر فوق كل خدمة لمعاينتها — واضغط عليها لفتح التفاصيل', 'Hover a service to preview it — tap to open the details')}</p>
        <div className="services-ledger" ref={ledgerRef} onMouseMove={handleLedgerMove} onMouseLeave={() => setActiveService(null)}>
          {services.map((service, i) => {
            const Icon = service.icon
            const open = openService === i
            return (
              <div className={`ledger-row${open ? ' is-open' : ''}${revealedRows.has(i) ? ' is-visible' : ''}`} key={service.en} onMouseEnter={() => setActiveService(i)} style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
                <button type="button" className="ledger-head" onClick={() => setOpenService(open ? -1 : i)} aria-expanded={open}>
                  <span className="ledger-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ledger-title">{t(service.ar, service.en)}</span>
                  <span className="ledger-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.8} /></span>
                  <span className="ledger-arrow" aria-hidden="true"><ArrowUpLeft size={18} /></span>
                </button>
                <div className="ledger-body">
                  <div className="ledger-body-inner">
                    <div className="ledger-body-content">
                      <img className="ledger-photo" src={servicePhoto(i)} alt="" loading="lazy" />
                      <p className="ledger-copy">{t(service.copy, service.copyEn)}</p>
                      <a className="ledger-cta" href="https://wa.me/962790967743" target="_blank" rel="noreferrer">{t('استفسر عن هذه الخدمة', 'Ask about this service')}<ArrowUpLeft size={15} /></a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className={`ledger-preview${activeService !== null ? ' is-shown' : ''}`} ref={previewRef} aria-hidden="true">
          <img src={servicePhoto(activeService ?? openService)} alt="" />
          <span className="ledger-preview-tag">{t(services[activeService ?? openService].ar, services[activeService ?? openService].en)}</span>
        </div>
      </section>

      <section className="work-section section-pad" id="work"><div className="work-heading"><div><div className="section-kicker">{t('من أرض الواقع', 'ON THE GROUND')}</div><h2>{t('شغلنا يحكي', 'Our work')}{' '}<span>{t('عنّا.', 'speaks for itself.')}</span></h2></div><p>{t('تفاصيل صغيرة، تصنع فرقاً كبيراً في تجربة صيدليتك.', 'Small details make a big difference to your pharmacy experience.')}</p></div><div className="work-grid">{images.map((image, index) => <figure className={`work-card work-card-${index + 1}`} key={image.src}><img className={image.className} src={image.src} alt={image.alt} loading="lazy"/><figcaption><span>{t('مشروع تطوير صيدلية', 'Pharmacy development project')}</span><ArrowUpLeft size={16}/></figcaption></figure>)}</div></section>

      <section className="contact-band" id="contact"><div className="contact-pattern"/><div className="contact-content"><div className="contact-orb"><Cross size={22}/></div><div className="contact-copy"><span>{t('خطوتك القادمة تبدأ من هنا', 'Your next step starts here')}</span><h2>{t('جاهز تطوّر صيدليتك؟', 'Ready to grow your pharmacy?')}</h2><p>{t('احكِ لنا عن صيدليتك — ونبدأ معاً.', 'Tell us about your pharmacy. Let’s get started.')}</p></div><a className="contact-button" href="https://wa.me/962790967743" target="_blank" rel="noreferrer"><MessageCircle size={19}/>{t('تواصل عبر واتساب', 'Chat on WhatsApp')}<ArrowUpLeft size={17}/></a></div><div className="contact-bottom"><span>{t('نرد عليك بكل اهتمام', 'We’ll be glad to hear from you')}</span><span><i/> {t('متاحون للاستفسارات', 'Available for enquiries')}</span></div></section>

      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark"><Cross size={20}/></span><span className="brand-copy"><strong>{t('سر التميز', 'SAR AL TAMAYOZ')}</strong><small>{t('لتطوير وإدارة الصيدليات', 'PHARMACY GROWTH & MANAGEMENT')}</small></span></a><p>{t('نرتّب اليوم لنكبر غداً.', 'Better organized. Ready to grow.')}</p><div className="footer-links"><a href="#services">{t('الخدمات', 'Services')}</a><a href="#work">{t('أعمالنا', 'Our work')}</a><a href="tel:0790967743">079 096 7743</a></div><span className="copyright">© {new Date().getFullYear()} {t('سر التميز. جميع الحقوق محفوظة.', 'Sar Al Tamayoz. All rights reserved.')}</span></footer>
      <a className="floating-whatsapp" href="https://wa.me/962790967743" target="_blank" rel="noreferrer" aria-label={t('تواصل معنا عبر واتساب', 'Contact us on WhatsApp')}><MessageCircle size={22}/></a>
    </main>
  )
}
