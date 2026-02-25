'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-black/5">
      <nav
        className="max-w-4xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-serif text-base hover:opacity-60 transition-opacity"
        >
          Jonathan Zhao
        </Link>
        <div className="flex items-center gap-6">
          {isHome ? (
            <>
              <a
                href="#work"
                className="font-sans text-sm text-black/60 hover:text-black transition-colors"
              >
                Work
              </a>
              <a
                href="#writing"
                className="font-sans text-sm text-black/60 hover:text-black transition-colors"
              >
                Writing
              </a>
            </>
          ) : (
            <>
              <Link
                href="/#work"
                className="font-sans text-sm text-black/60 hover:text-black transition-colors"
              >
                Work
              </Link>
              <Link
                href="/writing"
                className="font-sans text-sm text-black/60 hover:text-black transition-colors"
              >
                Writing
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
