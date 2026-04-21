'use client'

import { useMemo } from 'react'

const NUCLEOTIDES = ['A', 'T', 'G', 'C'] as const
const NUM_COLS = 16
const SEQ_LENGTH = 65

// Deterministic LCG so the sequence is stable across renders and SSR
function generateColumn(seed: number, length: number): string {
  let s = seed
  let result = ''
  for (let i = 0; i < length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0
    result += NUCLEOTIDES[s % 4] + '\n'
  }
  return result
}

export function DNABackground() {
  const columns = useMemo(
    () =>
      Array.from({ length: NUM_COLS }, (_, i) => ({
        // Each column gets a distinct seed, duration, and starting offset
        text: (() => {
          const seq = generateColumn(i * 7919 + 1, SEQ_LENGTH)
          return seq + seq // doubled for seamless loop
        })(),
        duration: 28 + (i % 6) * 3.5,
        // Negative delay starts mid-animation so columns are already offset on load
        delay: -(i * 2.3),
      })),
    []
  )

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none flex justify-between px-4"
      aria-hidden="true"
    >
      {columns.map((col, i) => (
        <div
          key={i}
          className="font-mono text-[10px] text-black whitespace-pre"
          style={{
            lineHeight: '1.45rem',
            opacity: 0.055,
            animation: `dnaScroll ${col.duration}s linear ${col.delay}s infinite`,
          }}
        >
          {col.text}
        </div>
      ))}
    </div>
  )
}
