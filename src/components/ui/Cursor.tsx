'use client'

import { useEffect, useRef } from 'react'

const FOLLOW = 0.18 // ring's per-frame catch-up toward the pointer (0–1)
const SPACING = 7 // px of pointer travel per trail particle
const MAX_PARTICLES = 260
const INTERACTIVE = 'a, button, [role="button"], label, summary, canvas'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
  accent: boolean
  phase: number
}

/** A soft glowing dot, drawn once and scaled per particle. */
function makeGlow(rgb: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  grad.addColorStop(0, `rgba(${rgb},1)`)
  grad.addColorStop(0.25, `rgba(${rgb},0.55)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 32, 32)
  return c
}

/**
 * A dot that tracks the pointer exactly, inside a ring that trails behind it,
 * leaving a drifting trail of light specks. The ring grows over interactive
 * elements and tightens while pressed.
 * Only for fine pointers without reduced motion; everyone else keeps the native cursor.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    const trail = trailRef.current
    const ctx = trail?.getContext('2d')
    if (!dot || !ring || !trail || !ctx) return

    const accentRGB = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim().split(/\s+/).join(',') || '134,239,172'
    const whiteGlow = makeGlow('235,240,238')
    const accentGlow = makeGlow(accentRGB)
    const particles: Particle[] = []
    let carry = 0 // leftover travel toward the next particle

    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      trail.width = Math.round(window.innerWidth * dpr)
      trail.height = Math.round(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (px: number, py: number, dx: number, dy: number) => {
      const speed = Math.hypot(dx, dy) || 1
      particles.push({
        x: px + (Math.random() - 0.5) * 10,
        y: py + (Math.random() - 0.5) * 10,
        // a little backward drift along the stroke, plus scatter
        vx: (-dx / speed) * 6 + (Math.random() - 0.5) * 22,
        vy: (-dy / speed) * 6 + (Math.random() - 0.5) * 22 - 4,
        age: 0,
        life: 0.7 + Math.random() * 0.8,
        size: 4 + Math.random() * 9,
        accent: Math.random() < 0.15,
        phase: Math.random() * Math.PI * 2,
      })
      if (particles.length > MAX_PARTICLES) particles.shift()
    }

    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    let x = -100
    let y = -100
    let rx = x
    let ry = y
    let hover = false
    let down = false
    let shown = false
    let raf = 0

    const setShown = (v: boolean) => {
      if (shown === v) return
      shown = v
      dot.style.opacity = ring.style.opacity = v ? '1' : '0'
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const nx = e.clientX
      const ny = e.clientY
      if (shown) {
        // Lay particles evenly along the path travelled since the last event.
        const dx = nx - x
        const dy = ny - y
        const dist = Math.hypot(dx, dy)
        carry += dist
        while (carry >= SPACING) {
          carry -= SPACING
          const t = dist ? 1 - carry / dist : 1
          spawn(x + dx * t, y + dy * t, dx, dy)
        }
      }
      x = nx
      y = ny
      if (!shown) { rx = x; ry = y } // don't sweep in from the corner
      setShown(true)
      hover = !!(e.target as Element | null)?.closest?.(INTERACTIVE)
    }
    const onDown = () => { down = true }
    const onUp = () => { down = false }
    const onLeave = () => setShown(false)

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // Trail: drift, slow down, flicker, fade.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.age += dt
        if (p.age >= p.life) { particles.splice(i, 1); continue }
        p.vx *= 0.96
        p.vy *= 0.96
        p.x += p.vx * dt
        p.y += p.vy * dt
        const t = p.age / p.life
        const twinkle = 0.75 + 0.25 * Math.sin(p.phase + p.age * 18)
        ctx.globalAlpha = (1 - t) * (1 - t) * twinkle * 0.9
        const r = p.size * (1 - 0.4 * t)
        ctx.drawImage(p.accent ? accentGlow : whiteGlow, p.x - r, p.y - r, r * 2, r * 2)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      rx += (x - rx) * FOLLOW
      ry += (y - ry) * FOLLOW
      const s = down ? 0.75 : hover ? 1.6 : 1
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${hover ? 0 : 1})`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${s})`
      ring.dataset.hover = String(hover)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden [.has-custom-cursor_&]:block">
      <canvas ref={trailRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-ink/60 opacity-0 transition-[opacity,background-color,border-color] duration-200 ease-out data-[hover=true]:border-accent data-[hover=true]:bg-accent/10"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent opacity-0 shadow-[0_0_8px_rgb(var(--accent))] transition-opacity duration-200"
      />
    </div>
  )
}
