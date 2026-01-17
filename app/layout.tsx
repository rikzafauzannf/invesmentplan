import type { Metadata } from 'next'
import './globals.css'

import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Crypto DCA Tracker',
  description: 'Aplikasi tracking investasi DCA Crypto dengan dark theme yang premium',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}


