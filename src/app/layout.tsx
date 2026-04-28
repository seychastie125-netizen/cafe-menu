import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Электронное меню',
  description: 'Меню кофейни',
  manifest: '/manifest.json',
  themeColor: '#1a1a1a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Кофейня',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  )
}
