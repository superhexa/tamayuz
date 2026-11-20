import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'سر التميز | تطوير وإدارة الصيدليات في الأردن',
  description: 'شريكك في تطوير وإدارة الصيدليات في الأردن. تنسيق الفروع، تنظيم المخزون، تدريب الكادر، التصميم والاستشارات بإدارة أحمد التميمي.',
  keywords: ['سر التميز', 'تطوير الصيدليات', 'إدارة الصيدليات', 'الأردن', 'صيدليات'],
  openGraph: {
    title: 'سر التميز | نرتّب اليوم لنكبر غداً',
    description: 'حلول متكاملة لتطوير وإدارة الصيدليات في الأردن.',
    locale: 'ar_JO',
    type: 'website',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
