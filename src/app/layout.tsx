import type { Metadata } from 'next'
import './globals.css'
import { instrumentSerif, plexSans, plexMono } from '@/lib/fonts'
import { defaultMetadata } from '@/lib/metadata'

export const metadata: Metadata = defaultMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
