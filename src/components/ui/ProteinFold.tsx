'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { PROTEINS } from '@/lib/fold/proteins'
import { FoldSimulation, MELT, SUBSTEP } from '@/lib/fold/simulation'
import { BASE_SPIN, PITCH, drawCartoon, newCamera } from '@/lib/fold/render'

const FOLD_SECONDS = 6 // duration of the fold itself
const FOLD_AT = 0.7 // s of denatured wobble before folding starts
const SIZE = 0.25 // model unit as a fraction of min(width, height)
const LAST_KEY = 'jz-fold-last'

/** A random structure, never the same one twice in a row. */
function pickProtein() {
  let pick = Math.floor(Math.random() * PROTEINS.length)
  try {
    const last = window.localStorage.getItem(LAST_KEY)
    if (last !== null && String(pick) === last) {
      pick = (pick + 1 + Math.floor(Math.random() * (PROTEINS.length - 1))) % PROTEINS.length
    }
    window.localStorage.setItem(LAST_KEY, String(pick))
  } catch {
    // storage blocked: any pick is fine
  }
  return PROTEINS[pick]
}

function readAccent(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  const parts = (raw || '134 239 172').split(/\s+/).map(Number)
  return [parts[0], parts[1], parts[2]]
}

/**
 * Background animation of a real PDB structure folding from a denatured chain
 * into its native state, drawn as cartoon ribbons. Position and size it with
 * `className` (it fills that box).
 */
export function ProteinFold({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const hudRef = useRef<HTMLSpanElement>(null)
  const refoldRef = useRef<() => void>(() => {})
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const entry = pickProtein()
    const sim = new FoldSimulation(entry)
    const cam = newCamera()
    const accent = readAccent()
    const reduce = !!reduceMotion
    if (reduce) {
      sim.settle()
      cam.zoom = 1
    }
    if (nameRef.current) nameRef.current.textContent = `${entry.name} · PDB ${entry.id} · ${sim.N} aa`

    let simTime = 0
    let foldAt = FOLD_AT
    const tauNow = () => (simTime - foldAt) / FOLD_SECONDS
    const showStats = (tau: number) => {
      if (!hudRef.current) return
      const { stage, rg, rmsd } = sim.stats(tau)
      hudRef.current.textContent = `${stage}  ·  Rg ${rg.toFixed(1)} Å  ·  RMSD ${rmsd.toFixed(1)} Å`
    }

    let w = 0
    let h = 0
    let dpr = 1
    let elapsed = 0
    const draw = (dt: number) => {
      if (!w) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawCartoon(ctx, sim, cam, {
        width: w,
        height: h,
        dt,
        accent,
        size: SIZE,
        reveal: reduce ? sim.N + 6 : (elapsed / 1.6) * (sim.N + 6),
        instant: reduce,
      })
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      if (reduce) draw(0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Drag to rotate (both axes), with spin inertia on release.
    let dragging = false
    let lastX = 0
    let lastY = 0
    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      cam.yaw += dx * 0.009
      cam.pitch = Math.max(-1.2, Math.min(1.2, cam.pitch + dy * 0.006))
      cam.spin = dx * 0.6
      if (reduce) draw(0)
    }
    const onUp = () => { dragging = false }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    const cleanupPointer = () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }

    if (reduce) {
      showStats(1.5)
      refoldRef.current = () => {}
      return () => { ro.disconnect(); cleanupPointer() }
    }

    // Melt back to denatured, then fold again (ignored while already melting).
    refoldRef.current = () => {
      if (tauNow() < 0) return
      foldAt = simTime + MELT
    }

    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e ? e.isIntersecting : true })
    io.observe(canvas)

    let raf = 0
    let last = performance.now()
    let acc = 0
    let hudT = 0
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (visible) {
        elapsed += dt
        acc += dt
        while (acc >= SUBSTEP) {
          acc -= SUBSTEP
          simTime += SUBSTEP
          sim.step(tauNow())
        }
        if (!dragging) {
          cam.spin += (BASE_SPIN - cam.spin) * Math.min(1, dt * 1.5)
          cam.yaw += cam.spin * dt
          cam.pitch += (PITCH - cam.pitch) * Math.min(1, dt * 0.8)
        }
        draw(dt)
        hudT -= dt
        if (hudT <= 0) {
          hudT = 0.15
          showStats(tauNow())
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      cleanupPointer()
    }
  }, [reduceMotion])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Live simulation of a protein folding: a denatured chain forms helices, then collapses into its native structure, drawn as lit cartoon ribbons. Drag to rotate."
        className="absolute inset-0 w-full h-full opacity-[0.85] cursor-grab active:cursor-grabbing touch-pan-y [mask-image:radial-gradient(closest-side,black_55%,transparent)]"
      />
      <p className="absolute bottom-0 right-6 flex flex-wrap items-center justify-end gap-x-4 font-mono text-[11px] tracking-[0.08em] text-dim">
        <span ref={nameRef} className="text-ink" />
        <span
          ref={hudRef}
          aria-hidden="true"
          className="hidden md:inline text-muted whitespace-pre tabular-nums"
        >
          denatured
        </span>
        <span>
          <span className="text-accent">FIG. 1</span> — 1° → 3°, folding
        </span>
        {!reduceMotion && (
          <button
            type="button"
            onClick={() => refoldRef.current()}
            className="min-h-[44px] px-1 text-muted hover:text-accent transition-colors"
          >
            ↻ refold
          </button>
        )}
      </p>
    </div>
  )
}
