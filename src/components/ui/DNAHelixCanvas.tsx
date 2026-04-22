'use client'

import { useRef, useEffect, useMemo } from 'react'
import { heroState } from '@/lib/heroState'

// ─── Constants ────────────────────────────────────────────────────────────────
const NUM_PAIRS      = 22
const TWIST_FULL     = (2 * Math.PI) / 10   // 36° per base pair (B-DNA)
const ROTATION_SPEED = 0.18                  // rad/s slow spin

// Warm coral/salmon palette — pleasant on white backgrounds
const C_BACKBONE: [number, number, number] = [208, 88, 62]
const C_BASE:     [number, number, number] = [232, 140, 108]
const C_CONNECT:  [number, number, number] = [218, 112, 82]

// ─── Phrase that coalesces alongside the DNA ──────────────────────────────────
const TEXT_FULL  = 'connecting the dots...'
const TEXT_CHARS = TEXT_FULL.split('')   // 31 characters

// ─── Seeded PRNG (LCG) ───────────────────────────────────────────────────────
function makePrng(seed: number) {
  let s = seed >>> 0
  return (): number => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

// ─── Glossy sphere via radial gradient ───────────────────────────────────────
function drawSphere(
  ctx:     CanvasRenderingContext2D,
  x:       number,
  y:       number,
  r:       number,
  rgb:     [number, number, number],
  opacity: number
) {
  if (r < 1 || opacity < 0.008) return
  const [R, G, B] = rgb
  const hx = x - r * 0.30
  const hy = y - r * 0.33
  const g  = ctx.createRadialGradient(hx, hy, r * 0.04, x, y, r)
  g.addColorStop(0,    `rgba(${Math.min(255,R+60)},${Math.min(255,G+55)},${Math.min(255,B+45)},${Math.min(1,opacity*1.55)})`)
  g.addColorStop(0.42, `rgba(${R},${G},${B},${opacity})`)
  g.addColorStop(1,    `rgba(${Math.max(0,R-45)},${Math.max(0,G-45)},${Math.max(0,B-35)},${opacity*0.06})`)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DNAHelixCanvas() {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const progressRef      = useRef(0)      // 0 = scattered, 1 = coalesced (can drift back)
  const textProgressRef  = useRef(0)      // text-only progress — only ever increases
  const coalescedRef     = useRef(false)  // true while scroll lock is released
  const lastInteractRef  = useRef(0)
  const prevFrameTimeRef = useRef<number | null>(null)
  const rafRef           = useRef<number | undefined>()

  const IDLE_MS    = 2200
  const DRIFT_RATE = 0.18

  // Scatter offsets for DNA atoms — 5 slots per pair
  const scatter = useMemo(() => {
    const rand = makePrng(314159)
    return Array.from({ length: NUM_PAIRS * 5 }, () => ({
      nx:    (rand() - 0.5) * 1.8,
      ny:    (rand() - 0.5) * 1.8,
      phase: rand() * Math.PI * 2,
      speed: 0.45 + rand() * 0.65,
    }))
  }, [])

  // Scatter offsets for text characters — one per character in TEXT_CHARS
  const textScatter = useMemo(() => {
    const rand = makePrng(271828)  // different seed from DNA scatter
    return Array.from({ length: TEXT_CHARS.length }, () => ({
      nx:    (rand() - 0.5) * 1.9,
      ny:    (rand() - 0.5) * 1.9,
      phase: rand() * Math.PI * 2,
      speed: 0.40 + rand() * 0.70,
    }))
  }, [])

  useEffect(() => {
    lastInteractRef.current = performance.now()

    // ── Helpers ───────────────────────────────────────────────────────────────
    const advanceProgress = (delta: number) => {
      lastInteractRef.current = performance.now()
      progressRef.current = Math.min(1, progressRef.current + delta / 350)
      if (progressRef.current >= 1) coalescedRef.current = true
    }

    const bypassCheck = () => {
      // User jumped past the hero via scrollbar / anchor — permanently release
      if (window.scrollY > window.innerHeight * 0.4) {
        coalescedRef.current = true
        progressRef.current  = 1
        return true
      }
      return false
    }

    // ── Input handlers ────────────────────────────────────────────────────────
    //
    // Two-phase lock:
    //   Phase 1 — typing not yet done: hold the page completely still, DNA frozen
    //   Phase 2 — typing done:         wheel/touch/key drives DNA coalescence
    //   After coalescence:             normal page scroll resumes

    const onWheel = (e: WheelEvent) => {
      if (bypassCheck()) return
      if (e.deltaY <= 0) return   // upward scroll at top — nothing to do

      if (!heroState.typingDone) {
        // Typing still in progress — eat the event but don't advance DNA
        e.preventDefault()
        return
      }

      if (coalescedRef.current) return   // already unlocked
      e.preventDefault()
      advanceProgress(e.deltaY)
    }

    let lastTouchY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (bypassCheck()) return
      const dy = lastTouchY - e.touches[0].clientY  // positive = scroll down
      lastTouchY = e.touches[0].clientY
      if (dy <= 0) return

      if (!heroState.typingDone) {
        e.preventDefault()
        return
      }

      if (coalescedRef.current) return
      e.preventDefault()
      lastInteractRef.current = performance.now()
      progressRef.current = Math.min(1, progressRef.current + dy / 220)
      if (progressRef.current >= 1) coalescedRef.current = true
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (bypassCheck()) return
      const DOWN = ['ArrowDown', ' ', 'PageDown']
      if (!DOWN.includes(e.key)) return

      if (!heroState.typingDone) {
        e.preventDefault()
        return
      }

      if (coalescedRef.current) return
      e.preventDefault()
      advanceProgress(80)
    }

    const onScroll = () => {
      if (!coalescedRef.current && window.scrollY > window.innerHeight * 0.4) {
        coalescedRef.current = true
        progressRef.current  = 1
      }
    }

    document.addEventListener('wheel',      onWheel,      { passive: false })
    document.addEventListener('touchstart', onTouchStart, { passive: true  })
    document.addEventListener('touchmove',  onTouchMove,  { passive: false })
    document.addEventListener('keydown',    onKeyDown)
    window.addEventListener(  'scroll',     onScroll,     { passive: true  })

    // ── Canvas setup ──────────────────────────────────────────────────────────
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width  = canvas!.offsetWidth  * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      ctx!.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const t0 = performance.now()

    // ── RAF loop ──────────────────────────────────────────────────────────────
    function frame(now: number) {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      if (!W || !H) { rafRef.current = requestAnimationFrame(frame); return }

      ctx!.clearRect(0, 0, W, H)

      const elapsed = (now - t0) / 1000
      const dt      = prevFrameTimeRef.current !== null ? (now - prevFrameTimeRef.current) / 1000 : 0
      prevFrameTimeRef.current = now

      // ── Idle drift (only after typing is done) ──────────────────────────
      const idleMs = now - lastInteractRef.current
      if (
        heroState.typingDone &&
        idleMs > IDLE_MS &&
        progressRef.current > 0 &&
        window.scrollY <= 4
      ) {
        progressRef.current = Math.max(0, progressRef.current - DRIFT_RATE * dt)
        if (coalescedRef.current && progressRef.current < 1) {
          coalescedRef.current = false
        }
      }

      const raw = progressRef.current
      const t   = raw * raw * (3 - 2 * raw)   // smoothstep — drives DNA spheres

      // Text progress only ever increases, so the phrase stays once coalesced
      textProgressRef.current = Math.max(textProgressRef.current, raw)
      const rawText = textProgressRef.current
      const tText   = rawText * rawText * (3 - 2 * rawText)

      const lerp = (a: number, b: number) => a + (b - a) * t

      const rotation = elapsed * ROTATION_SPEED
      const helixR   = Math.max(48, Math.min(W * 0.075, 88))
      const cx       = W / 2
      const pitch    = H / (NUM_PAIRS + 5)
      const startY   = (H - (NUM_PAIRS - 1) * pitch) / 2
      const PERSP    = helixR * 5.5

      // ── Build DNA atom + bond lists ───────────────────────────────────────
      type Atom = {
        x: number; y: number; r: number
        rgb: [number, number, number]
        opacity: number; depth: number
      }

      const atoms:     Atom[]             = []
      const bondPairs: [number, number][] = []
      type HelixPt = { hx: number; hy: number; depth: number }
      const s1pts: HelixPt[] = []
      const s2pts: HelixPt[] = []

      for (let i = 0; i < NUM_PAIRS; i++) {
        const angle = i * TWIST_FULL + rotation
        const yH    = startY + i * pitch

        const x1 =  helixR * Math.cos(angle), z1 =  helixR * Math.sin(angle)
        const x2 = -x1,                        z2 = -z1

        const f1 = PERSP / (PERSP + z1), f2 = PERSP / (PERSP + z2)
        const d1 = 0.12 + 0.88 * (helixR - z1) / (2 * helixR)
        const d2 = 0.12 + 0.88 * (helixR - z2) / (2 * helixR)

        const hx1 = cx + x1 * f1, hy1 = yH
        const hx2 = cx + x2 * f2, hy2 = yH
        s1pts.push({ hx: hx1, hy: hy1, depth: d1 })
        s2pts.push({ hx: hx2, hy: hy2, depth: d2 })

        const si1 = i * 5, si2 = i * 5 + 1, si3 = i * 5 + 2
        const oscAmt = (1 - t) * 16
        const osc1 = Math.sin(elapsed * scatter[si1].speed + scatter[si1].phase) * oscAmt
        const osc2 = Math.sin(elapsed * scatter[si2].speed + scatter[si2].phase) * oscAmt
        const osc3 = Math.sin(elapsed * scatter[si3].speed + scatter[si3].phase) * oscAmt * 0.8

        const sx1 = cx + scatter[si1].nx * W * 0.44 + osc1 * 0.6
        const sy1 = H * 0.5 + scatter[si1].ny * H * 0.44 + osc1 * 0.4
        const sx2 = cx + scatter[si2].nx * W * 0.44 + osc2 * 0.6
        const sy2 = H * 0.5 + scatter[si2].ny * H * 0.44 + osc2 * 0.4
        const sx3 = cx + scatter[si3].nx * W * 0.36
        const sy3 = H * 0.5 + scatter[si3].ny * H * 0.36 + osc3

        const hrx = (hx1 + hx2) / 2, hry = (hy1 + hy2) / 2
        const idxS1 = atoms.length, idxS2 = idxS1 + 1

        atoms.push({ x: lerp(sx1,hx1), y: lerp(sy1,hy1), r: 7.5+d1*6.5, rgb: C_BACKBONE, opacity: lerp(0.22,0.14+d1*0.44), depth: lerp(0.5,d1) })
        atoms.push({ x: lerp(sx2,hx2), y: lerp(sy2,hy2), r: 7.5+d2*6.5, rgb: C_BACKBONE, opacity: lerp(0.22,0.14+d2*0.44), depth: lerp(0.5,d2) })
        atoms.push({ x: lerp(sx3,hrx), y: lerp(sy3,hry), r: lerp(5,6.5),  rgb: C_BASE,     opacity: lerp(0.16,0.22),          depth: 0.5 })

        bondPairs.push([idxS1, idxS1+2], [idxS1+2, idxS2])
        if (i > 0) bondPairs.push([idxS1-3, idxS1], [idxS1-2, idxS2])
      }

      for (let i = 0; i < NUM_PAIRS - 1; i++) {
        const si4 = i * 5 + 3, si5 = i * 5 + 4
        const a1 = s1pts[i], b1 = s1pts[i+1], a2 = s2pts[i], b2 = s2pts[i+1]
        const chx1 = (a1.hx+b1.hx)/2, chy1 = (a1.hy+b1.hy)/2
        const chx2 = (a2.hx+b2.hx)/2, chy2 = (a2.hy+b2.hy)/2
        const cd1 = (a1.depth+b1.depth)/2, cd2 = (a2.depth+b2.depth)/2
        const oscAmt = (1 - t) * 14
        const osc4 = Math.sin(elapsed * scatter[si4].speed + scatter[si4].phase) * oscAmt
        const osc5 = Math.sin(elapsed * scatter[si5].speed + scatter[si5].phase) * oscAmt
        atoms.push({ x: lerp(cx+scatter[si4].nx*W*0.40+osc4*0.5,chx1), y: lerp(H*0.5+scatter[si4].ny*H*0.40+osc4*0.4,chy1), r: 5+cd1*4, rgb: C_CONNECT, opacity: lerp(0.18,0.12+cd1*0.32), depth: lerp(0.5,cd1) })
        atoms.push({ x: lerp(cx+scatter[si5].nx*W*0.40+osc5*0.5,chx2), y: lerp(H*0.5+scatter[si5].ny*H*0.40+osc5*0.4,chy2), r: 5+cd2*4, rgb: C_CONNECT, opacity: lerp(0.18,0.12+cd2*0.32), depth: lerp(0.5,cd2) })
      }

      // ── Painter sort and draw DNA ─────────────────────────────────────────
      const sorted = [...atoms].sort((a, b) => a.depth - b.depth)
      const bondOp = t * 0.20
      if (bondOp > 0.004) {
        ctx!.lineWidth = 1.5
        ctx!.strokeStyle = `rgba(200,96,72,${bondOp})`
        for (const [ai, bi] of bondPairs) {
          const a = atoms[ai], b = atoms[bi]
          if (!a || !b) continue
          ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke()
        }
      }
      for (const a of sorted) drawSphere(ctx!, a.x, a.y, a.r, a.rgb, a.opacity)

      // ── Scattered text characters → "turning separate ideas into one" ─────
      //
      // Font size grows from tiny (scattered debris) to large (final statement).
      // All 31 characters land on a single centred line to the right of the helix.
      ctx!.save()
      ctx!.textBaseline = 'alphabetic'
      ctx!.textAlign    = 'left'

      // Available horizontal band to the right of the helix
      const textLeft    = cx + helixR * 2.2
      const textRight   = W - 24
      const availW      = Math.max(60, textRight - textLeft)

      // Compute the large font size that fills ~90% of available width
      const REF_SIZE    = 40
      ctx!.font         = `${REF_SIZE}px 'Fira Code', monospace`
      const refW        = ctx!.measureText(TEXT_FULL).width
      const fitFontSize = REF_SIZE * (availW * 0.90) / refW

      const smallFontSize = Math.max(9, W * 0.009)
      const largeFontSize = Math.max(smallFontSize + 1, fitFontSize)
      const fontSize      = smallFontSize + tText * (largeFontSize - smallFontSize)

      ctx!.font = `${fontSize}px 'Fira Code', monospace`

      // Single line centred in the available band, vertically centred in canvas
      const textCx      = (textLeft + textRight) / 2
      const lineWidth   = ctx!.measureText(TEXT_FULL).width
      const targetLineX = textCx - lineWidth / 2
      const targetLineY = H / 2 + fontSize * 0.38

      const lerpText = (a: number, b: number) => a + (b - a) * tText

      let advX = 0
      for (let ci = 0; ci < TEXT_CHARS.length; ci++) {
        const char  = TEXT_CHARS[ci]
        const charW = ctx!.measureText(char).width

        const targetX = targetLineX + advX
        const targetY = targetLineY

        const s      = textScatter[ci]
        const oscAmt = (1 - tText) * 20
        const osc    = Math.sin(elapsed * s.speed + s.phase) * oscAmt
        const scx    = cx + s.nx * W * 0.46 + osc * 0.55
        const scy    = H * 0.5 + s.ny * H * 0.44 + osc * 0.40

        const px = lerpText(scx, targetX)
        const py = lerpText(scy, targetY)

        const opacity = 0.10 + tText * 0.60
        ctx!.fillStyle = `rgba(50, 38, 30, ${opacity})`
        ctx!.fillText(char, px, py)

        advX += charW
      }
      ctx!.restore()

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      document.removeEventListener('wheel',      onWheel)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove',  onTouchMove)
      document.removeEventListener('keydown',    onKeyDown)
      window.removeEventListener(  'scroll',     onScroll)
    }
  }, [scatter, textScatter])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    />
  )
}
