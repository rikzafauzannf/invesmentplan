import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

export const metadata: Metadata = {
  title: 'DCA Terminal | Crypto Portfolio',
  description: 'Aplikasi tracking investasi DCA Crypto dengan dark theme yang premium',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased bg-background text-foreground overflow-x-hidden">
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}


