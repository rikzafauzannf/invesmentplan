import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BTC DCA Tracker',
  description: 'Aplikasi tracking investasi DCA Bitcoin dengan dark theme yang menarik',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}

