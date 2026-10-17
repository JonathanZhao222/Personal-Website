'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ProteinFold } from '@/components/ui/ProteinFold'

const inlineLink =
  'text-ink underline decoration-white/25 underline-offset-[3px] hover:text-accent hover:decoration-accent transition-colors'

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={inlineLink}>
      {children}
    </a>
  )
}

const bio = [
  <>
    I&apos;m a student at Stanford studying Math &amp; CS.
  </>,
  <>
    My current research spans virtual cells and explicit regularisation. And I&apos;m broadly
    interested in AI for science and ways to understand broad ranges of data.
  </>,
  <>
    Previously, I&apos;ve done research in protein language modelling{' '}
    @<Ext href="https://www.pumpkinseed.bio/">Pumpkinseed</Ext>, paralog dependency @Stanford and water
    pollution with the UK government, where I won the{' '}
    <Ext href="https://stockholmwaterfoundation.org/news/uk-project-to-reduce-pfas-pollution-is-awarded-stockholm-junior-water-prize">
      Stockholm Junior Water Prize
    </Ext>{' '}
    and was featured in{' '}
    <Ext href="https://www.forbes.com/sites/sanammahoozi/2024/09/06/this-is-what-happened-at-world-water-week-in-stockholm/">
      Forbes
    </Ext>
    .
  </>,
  <>
    In my free time, I sing Baritone for Stanford O-tone and compete for Stanford (and prev. England)
    Debate.
  </>,
]

const facts: { label: string; value: string; live?: boolean }[] = [
  { label: 'NOW', value: 'Undergraduate, Stanford' },
  { label: 'CURRENTLY', value: 'Arc Institute', live: true },
  { label: 'INCOMING', value: 'Bridgewater Associates' },
  { label: 'IN ANOTHER LIFE', value: 'Organist at Duomo Cathedral' },
  { label: 'LISTENING TO', value: 'The New Abnormal' },
]

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ── Reveal: plain div on SSR / reduced motion, fade-up once mounted ───────────
function Reveal({
  animate,
  delay,
  className,
  children,
}: {
  animate: boolean
  delay: number
  className?: string
  children: React.ReactNode
}) {
  if (!animate) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export default function Hero() {
  const shouldReduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const animate = mounted && !shouldReduceMotion
  const nameClass =
    'm-0 font-serif font-normal text-[clamp(64px,9vw,132px)] leading-[0.92] tracking-[-0.02em]'

  return (
    <section id="top" className="relative max-w-plate mx-auto px-6 pt-36 pb-[104px]">
      <ProteinFold className="absolute top-28 bottom-6 -right-[8%] w-[min(860px,72%)] max-md:inset-x-0 max-md:w-auto max-md:opacity-50" />

      <div className="relative z-10 flex items-center gap-4 font-mono text-xs tracking-[0.16em] mb-12 pointer-events-none">
        <span className="text-accent">1° PRIMARY</span>
        <span aria-hidden="true" className="flex-auto h-px bg-white/10" />
        <span className="text-dim hidden sm:inline">STANFORD, CA · 37.43° N 122.17° W</span>
      </div>

      <div className="relative z-10 max-w-[600px]">
        <div>
          {animate ? (
            <motion.h1
              className={nameClass}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              aria-label="Jonathan Zhao"
            >
              <motion.span variants={wordVariants} className="inline-block" aria-hidden="true">
                Jonathan
              </motion.span>{' '}
              <motion.span variants={wordVariants} className="inline-block italic text-soft" aria-hidden="true">
                Zhao
              </motion.span>
            </motion.h1>
          ) : (
            <h1 className={nameClass}>
              Jonathan <span className="italic text-soft">Zhao</span>
            </h1>
          )}

          <Reveal animate={animate} delay={0.35}>
            <div className="mt-9 max-w-[560px] flex flex-col gap-4 text-[17px] leading-[1.65] text-body">
              {bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>

          <Reveal animate={animate} delay={0.5}>
            <dl className="mt-12 max-w-[560px] border-t border-white/10">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="group flex flex-wrap gap-x-6 gap-y-1 py-3.5 border-b border-white/[0.06] transition-colors duration-300 hover:border-white/15"
                >
                  <dt className="flex-[0_0_140px] font-mono text-[11px] tracking-[0.14em] text-dim pt-[3px] transition-colors duration-300 group-hover:text-accent">
                    {f.label}
                  </dt>
                  <dd className="m-0 flex-[1_1_260px] text-[15px] leading-[1.55] text-ink flex items-center gap-2.5">
                    {f.live && (
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]"
                      />
                    )}
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
