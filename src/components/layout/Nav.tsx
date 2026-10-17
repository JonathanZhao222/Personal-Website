'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const linkClass = 'text-muted hover:text-accent transition-colors'

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ground/85 backdrop-blur-sm">
      <nav
        className="max-w-plate mx-auto px-6 h-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] font-mono text-[13px]"
        aria-label="Main navigation"
      >
        <Link href="/" className="font-medium tracking-[0.04em] hover:text-accent transition-colors">
          Jonathan Zhao
        </Link>
        <div className="flex items-center gap-7">
          {isHome ? (
            <>
              <a href="#work" className={linkClass}>/work</a>
              <a href="#research" className={linkClass}>/research</a>
              <a href="#writing" className={linkClass}>/writing</a>
            </>
          ) : (
            <>
              <Link href="/#work" className={linkClass}>/work</Link>
              <Link href="/#research" className={linkClass}>/research</Link>
              <Link href="/writing" className={linkClass}>/writing</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
