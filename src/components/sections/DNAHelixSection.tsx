'use client'

import { useRef, useEffect } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

// ─── Helix constants ──────────────────────────────────────────────────────────
const NUM_PAIRS   = 28
const TWIST_FULL  = (2 * Math.PI) / 10   // 36° per base pair (B-DNA geometry)
const BASE_RADIUS = 52                    // logical px
const PERSP       = 300                   // perspective focal depth

// ─── Drawing ──────────────────────────────────────────────────────────────────
//
// Convention
//   - Helix axis runs vertically (screen Y)
//   - x  = lateral spread (screen X)
//   - z  = depth: POSITIVE z = away from viewer, NEGATIVE z = toward viewer
//
// Strand 1:  x1 =  R·cos(θ),   z1 =  R·sin(θ)
// Strand 2:  x2 = -R·cos(θ),   z2 = -R·sin(θ)   (exactly π offset)
//
// Perspective:   screenX = cx + x · PERSP / (PERSP + z)
//   z > 0 → divisor larger → point shrinks   (back)
//   z < 0 → divisor smaller → point grows    (front)
//
// Depth opacity: d = 0.12 + 0.88 · (R − z) / 2R
//   z = -R (front) → d = 1.00
//   z = +R (back)  → d = 0.12

function drawHelix(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  unwind: number,    // 0 = full helix, 1 = fully unwound
  rotation: number   // continuous spin (rad)
) {
  ctx.clearRect(0, 0, W, H)

  const cx     = W / 2
  const pitch  = H / (NUM_PAIRS + 4)
  const startY = (H - (NUM_PAIRS - 1) * pitch) / 2

  // Smoothstep easing on the unwind parameter
  const t     = unwind * unwind * (3 - 2 * unwind)
  const twist = TWIST_FULL * (1 - t)
  const R     = BASE_RADIUS * (1 + t * 0.45)   // strands drift apart as they unwind

  type Pt = { sx: number; sy: number; z: number; depth: number }
  const s1: Pt[] = []
  const s2: Pt[] = []

  for (let i = 0; i < NUM_PAIRS; i++) {
    const angle = i * twist + rotation
    const y     = startY + i * pitch

    const x1 =  R * Math.cos(angle)
    const z1 =  R * Math.sin(angle)   // positive = back
    const x2 = -x1
    const z2 = -z1                    // always opposite

    const f1 = PERSP / (PERSP + z1)
    const f2 = PERSP / (PERSP + z2)

    s1.push({ sx: cx + x1 * f1, sy: y, z: z1, depth: 0.12 + 0.88 * (R - z1) / (2 * R) })
    s2.push({ sx: cx + x2 * f2, sy: y, z: z2, depth: 0.12 + 0.88 * (R - z2) / (2 * R) })
  }

  // Painter's algorithm — three passes so front strand visually crosses over rungs
  const drawSeg = (strand: Pt[], i: number) => {
    const a = strand[i], b = strand[i + 1]
    ctx.beginPath()
    ctx.moveTo(a.sx, a.sy)
    ctx.lineTo(b.sx, b.sy)
    ctx.strokeStyle = `rgba(0,0,0,${(a.depth + b.depth) / 2})`
    ctx.lineWidth   = 2.5
    ctx.stroke()
  }

  const drawDot = (p: Pt) => {
    ctx.beginPath()
    ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,0,0,${p.depth})`
    ctx.fill()
  }

  // Pass 1 — back segments + back dots (z > 0)
  for (let i = 0; i < NUM_PAIRS - 1; i++) {
    if ((s1[i].z + s1[i + 1].z) / 2 > 0) drawSeg(s1, i)
    if ((s2[i].z + s2[i + 1].z) / 2 > 0) drawSeg(s2, i)
  }
  for (const p of s1) if (p.z > 0) drawDot(p)
  for (const p of s2) if (p.z > 0) drawDot(p)

  // Pass 2 — rungs (hydrogen bonds), always between the two passes
  for (let i = 0; i < NUM_PAIRS; i++) {
    ctx.beginPath()
    ctx.moveTo(s1[i].sx, s1[i].sy)
    ctx.lineTo(s2[i].sx, s2[i].sy)
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth   = 1.5
    ctx.stroke()
  }

  // Pass 3 — front segments + front dots (z ≤ 0)
  for (let i = 0; i < NUM_PAIRS - 1; i++) {
    if ((s1[i].z + s1[i + 1].z) / 2 <= 0) drawSeg(s1, i)
    if ((s2[i].z + s2[i + 1].z) / 2 <= 0) drawSeg(s2, i)
  }
  for (const p of s1) if (p.z <= 0) drawDot(p)
  for (const p of s2) if (p.z <= 0) drawDot(p)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DNAHelixSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const unwindRef  = useRef(0)
  const rafRef     = useRef<number | undefined>()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Keep unwind value readable inside the RAF loop without re-renders
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    unwindRef.current = v
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas backing store to physical pixels, draw in logical CSS pixels
    function setupCanvas() {
      const dpr = window.devicePixelRatio || 1
      const w   = canvas!.offsetWidth
      const h   = canvas!.offsetHeight
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
      ctx!.scale(dpr, dpr)   // setting canvas.width resets transform, so this is always fresh
    }

    setupCanvas()
    const ro = new ResizeObserver(setupCanvas)
    ro.observe(canvas)

    const t0 = performance.now()

    function loop(now: number) {
      const elapsed  = (now - t0) / 1000
      const rotation = elapsed * 0.22   // ~0.22 rad/s slow spin

      drawHelix(
        ctx!,
        canvas!.offsetWidth,
        canvas!.offsetHeight,
        unwindRef.current,
        rotation
      )

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    // Outer div is the scroll target — 200vh gives 100vh of scroll travel
    <div ref={sectionRef} className="relative overflow-hidden" style={{ height: '200vh' }}>
      {/* Sticky inner — stays fixed in view while the outer scrolls */}
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: '300px', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  )
}
