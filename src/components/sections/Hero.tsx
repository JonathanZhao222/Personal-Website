'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { DNAHelixCanvas } from '@/components/ui/DNAHelixCanvas'
import { heroState } from '@/lib/heroState'

const heroName = 'Jonathan Zhao'
const tagline1 = "I'm a student at Stanford. I research and build in comp bio & climate tech."
const tagline2 = "I also debated for England & Stanford Debate and played piano & organ @ Milan's Duomo Cathedral."

const TYPE_SPEED_MS = 22    // ms per character
const LINE_PAUSE_MS = 380   // pause between the two lines
const NAME_DELAY_MS = 1150  // wait for name animation before typing starts

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const arrowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 1.0 } },
}

// ── Blinking cursor span ───────────────────────────────────────────────────────
function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="cursor-blink inline-block w-[1.5px] h-[1em] bg-black/35 ml-[2px] align-middle"
    />
  )
}

// ── Static shell (SSR + reduced-motion fallback) ───────────────────────────────
// Shows all text immediately — no animation, no layout shift on first paint.
function HeroStatic() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center">
      <DNAHelixCanvas />
      <div className="max-w-4xl mx-auto w-full px-6 md:px-8 pt-14 relative z-10">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight">
          {heroName}
        </h1>
        <p className="mt-6 font-sans text-base md:text-lg text-black/55 max-w-sm leading-relaxed">
          {tagline1}
        </p>
        <p className="mt-3 font-sans text-base md:text-lg text-black/55 max-w-sm leading-relaxed">
          {tagline2}
        </p>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-black/25 text-sm font-sans select-none z-10">
        ↓
      </div>
    </section>
  )
}

// ── Main hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted]   = useState(false)
  const [typed1, setTyped1]     = useState('')
  const [typed2, setTyped2]     = useState('')
  // Which line is currently receiving the cursor: 1, 2, or null (done)
  const [cursorOn, setCursorOn] = useState<1 | 2 | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Typewriter sequence — starts after name animation, uses recursive setTimeout
  // so a single `alive` flag cleanly cancels every pending tick on unmount.
  useEffect(() => {
    if (!mounted || shouldReduceMotion) return

    let alive = true

    const startLine2 = () => {
      if (!alive) return
      setCursorOn(2)
      let j = 0
      const tick2 = () => {
        if (!alive) return
        j++
        setTyped2(tagline2.slice(0, j))
        if (j < tagline2.length) setTimeout(tick2, TYPE_SPEED_MS)
        else { setCursorOn(null); heroState.typingDone = true }
      }
      tick2()
    }

    const startLine1 = () => {
      if (!alive) return
      setCursorOn(1)
      let i = 0
      const tick1 = () => {
        if (!alive) return
        i++
        setTyped1(tagline1.slice(0, i))
        if (i < tagline1.length) setTimeout(tick1, TYPE_SPEED_MS)
        else setTimeout(startLine2, LINE_PAUSE_MS)
      }
      tick1()
    }

    const kickoff = setTimeout(startLine1, NAME_DELAY_MS)
    return () => { alive = false; clearTimeout(kickoff) }
  }, [mounted, shouldReduceMotion])

  if (!mounted || shouldReduceMotion) return <HeroStatic />

  return (
    <section className="relative min-h-screen flex flex-col justify-center">
      <DNAHelixCanvas />
      <div className="max-w-4xl mx-auto w-full px-6 md:px-8 pt-14 relative z-10">

        {/* Name — word-by-word blur-up animation */}
        <motion.h1
          className="font-serif text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label={heroName}
        >
          {heroName.split(' ').map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="inline-block mr-[0.25em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Taglines — typewriter reveal */}
        <p className="mt-6 font-sans text-base md:text-lg text-black/55 max-w-sm leading-relaxed">
          {typed1}
          {cursorOn === 1 && <Cursor />}
        </p>
        <p className="mt-3 font-sans text-base md:text-lg text-black/55 max-w-sm leading-relaxed">
          {typed2}
          {cursorOn === 2 && <Cursor />}
        </p>

      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-black/25 text-sm font-sans select-none z-10"
        variants={arrowVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="block"
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  )
}
