'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const heroName = 'Jonathan Zhao'
const tagline1 = "I'm a student at Stanford. I research and build in comp bio & neuro."
const tagline2 = "I also debated for England & Stanford Debate and played piano & organ @ Milan's Duomo Cathedral."

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const taglineVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.55 },
  },
}

const arrowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, delay: 1.0 },
  },
}

// Static shell — rendered on server and on the initial client paint.
// Switching to the animated version happens after mount (useEffect),
// so the browser never paints opacity:0 inline styles on first load.
function HeroStatic() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-8 max-w-4xl mx-auto">
      <div className="pt-14">
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
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-black/25 text-sm font-sans select-none">
        ↓
      </div>
    </section>
  )
}

export default function Hero() {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || shouldReduceMotion) {
    return <HeroStatic />
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-8 max-w-4xl mx-auto">
      <div className="pt-14">
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

        <motion.p
          className="mt-6 font-sans text-base md:text-lg text-black/55 max-w-sm leading-relaxed"
          variants={taglineVariants}
          initial="hidden"
          animate="visible"
        >
          {tagline1}
        </motion.p>
        <motion.p
          className="mt-3 font-sans text-base md:text-lg text-black/55 max-w-sm leading-relaxed"
          variants={taglineVariants}
          initial="hidden"
          animate="visible"
        >
          {tagline2}
        </motion.p>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-black/25 text-sm font-sans select-none"
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
