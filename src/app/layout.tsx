import type { Metadata } from 'next'
import './globals.css'
import { instrumentSerif, inter, firaCode } from '@/lib/fonts'
import { defaultMetadata } from '@/lib/metadata'

export const metadata: Metadata = defaultMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable} ${firaCode.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
