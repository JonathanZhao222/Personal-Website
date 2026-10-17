import type { FoldSimulation } from './simulation'
import { type V, add, catmull, centroid, clamp01, cross, dot, len, norm, scale, sub } from './geometry'

type RGB = [number, number, number]

const BG: RGB = [11, 13, 13]
const TUBE_RGB: RGB = [196, 202, 199]
const TUBE = 0.022 // loop half-width
const RIBBON = 0.105 // helix/strand half-width
const D = 4.2 // camera distance
const LIGHT = norm([-0.45, -0.55, 0.7])
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1])

export const BASE_SPIN = 0.14 // rad/s
export const PITCH = 0.32

export interface Camera {
  yaw: number
  pitch: number
  spin: number
  /** Eases toward 1 as the chain compacts, so the fold stays framed. */
  zoom: number
  /** Follows the chain's centroid. */
  target: V
}

export const newCamera = (): Camera => ({
  yaw: -0.5,
  pitch: PITCH,
  spin: BASE_SPIN,
  zoom: 0.55,
  target: [0, 0, 0],
})

interface DrawOptions {
  width: number
  height: number
  dt: number
  accent: RGB
  /** Fraction of min(width, height) one model unit spans at zoom 1. */
  size: number
  /** Residues revealed so far (the chain draws itself in on load). */
  reveal: number
  /** Snap the camera instead of easing. */
  instant: boolean
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

/** Lit, fogged cartoon ribbons (helices, arrowed strands, tube loops), painter-sorted. */
export function drawCartoon(
  ctx: CanvasRenderingContext2D,
  sim: FoldSimulation,
  cam: Camera,
  { width: w, height: h, dt, accent, size, reveal, instant }: DrawOptions,
) {
  const { N, x } = sim
  ctx.clearRect(0, 0, w, h)

  // Camera: follow the centroid and auto-frame as the chain compacts.
  const c = centroid(x)
  let rr = 0
  for (const q of x) {
    const d = sub(q, c)
    rr += dot(d, d) / N
  }
  const compact = clamp01(sim.rNative / Math.sqrt(rr))
  cam.zoom += (Math.max(0.36, compact) - cam.zoom) * (instant ? 1 : Math.min(1, dt * 2.2))
  const follow = instant ? 1 : Math.min(1, dt * 3)
  for (let a = 0; a < 3; a++) cam.target[a] += (c[a] - cam.target[a]) * follow

  const s = Math.min(w, h) * size * 1.3 * cam.zoom
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw)
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch)
  const ox = w / 2
  const oy = h / 2
  const view: V[] = x.map((q) => {
    const X = q[0] - cam.target[0], Y = q[1] - cam.target[1], Z = q[2] - cam.target[2]
    const x1 = X * cy + Z * sy
    const z1 = -X * sy + Z * cy
    return [x1, Y * cp - z1 * sp, Y * sp + z1 * cp]
  })
  const proj = (q: V): [number, number] => {
    const k = D / (D - q[2])
    return [ox + q[0] * s * k, oy + q[1] * s * k]
  }

  // Soft accent glow that builds as the fold compacts.
  const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, s * 1.5)
  glow.addColorStop(0, `rgba(${accent.join(',')},${0.13 * compact * compact})`)
  glow.addColorStop(1, `rgba(${accent.join(',')},0)`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // Secondary-structure weights per residue.
  const hwRes = new Float32Array(N)
  const swRes = new Float32Array(N)
  const arrow = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const j = sim.helixOf[i]
    hwRes[i] = j >= 0 ? sim.hw[j] : 0
    const k = sim.strandOf[i]
    swRes[i] = k >= 0 ? sim.sw[k] : 0
  }
  const widthF = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    widthF[i] = (hwRes[Math.max(0, i - 1)] + 2 * hwRes[i] + hwRes[Math.min(N - 1, i + 1)]) / 4
  }
  sim.strands.forEach((st, k) => {
    for (let i = st.a; i < st.b; i++) widthF[i] = Math.max(widthF[i], sim.sw[k] * 0.9)
    arrow[st.b - 1] = sim.sw[k]
  })

  // Guide points: helices pulled toward their axis, strands de-pleated.
  const inset = 1.05 * sim.m.sc
  const bisN = view.map((q, i) => {
    if (i === 0 || i === N - 1) return null
    const b = sub(scale(q, 2), add(view[i - 1], view[i + 1]))
    const l = len(b)
    return l < 1e-6 ? null : scale(b, 1 / l)
  })
  const G = view.map((q, i) => {
    const bn = bisN[i]
    if (hwRes[i] > 0 && bn) return sub(q, scale(bn, inset * hwRes[i]))
    if (swRes[i] > 0 && i > 0 && i < N - 1) {
      const avg = scale(add(add(view[i - 1], view[i + 1]), scale(q, 2)), 0.25)
      return add(q, scale(sub(avg, q), swRes[i]))
    }
    return q
  })

  // Ribbon width directions: face the camera on loops, the helix/sheet plane on SSEs.
  const Wraw: V[] = []
  for (let i = 0; i < N; i++) {
    const t = norm(sub(G[Math.min(N - 1, i + 1)], G[Math.max(0, i - 1)]))
    let wl = cross(t, [0, 0, 1])
    wl = len(wl) < 1e-4 ? [1, 0, 0] : norm(wl)
    let wv = wl
    const fw = Math.max(hwRes[i], swRes[i])
    const bn = bisN[i]
    if (fw > 0 && bn) {
      let wh = cross(t, bn)
      if (len(wh) > 1e-4) {
        wh = norm(wh)
        if (i > 0 && dot(wh, Wraw[i - 1]) < 0) wh = scale(wh, -1)
        else if (i === 0 && dot(wh, wl) < 0) wh = scale(wh, -1)
        const base = i > 0 && dot(wl, Wraw[i - 1]) < 0 ? scale(wl, -1) : wl
        wv = norm(add(scale(base, 1 - fw), scale(wh, fw)))
      }
    }
    if (i > 0 && dot(wv, Wraw[i - 1]) < 0) wv = scale(wv, -1)
    Wraw.push(wv)
  }
  const W = Wraw.map((wv, i) => {
    const sm = add(add(Wraw[Math.max(0, i - 1)], Wraw[Math.min(N - 1, i + 1)]), scale(wv, 2))
    return len(sm) < 1e-6 ? wv : norm(sm)
  })

  // Spline samples.
  const SUB = Math.max(4, Math.min(10, Math.round(1500 / N)))
  const half = (f: number) => TUBE + (RIBBON - TUBE) * f
  type Sample = { p: V; w: V; hw: number; sw: number; half: number; res: number }
  const S: Sample[] = []
  for (let i = 0; i < N - 1; i++) {
    const p0 = G[Math.max(0, i - 1)], p1 = G[i], p2 = G[i + 1], p3 = G[Math.min(N - 1, i + 2)]
    for (let k = 0; k < SUB; k++) {
      const f = k / SUB
      let hf = half(widthF[i] + (widthF[i + 1] - widthF[i]) * f)
      if (arrow[i] > 0) {
        const head = (TUBE + (1.75 * RIBBON - TUBE) * arrow[i]) * (1 - f) + TUBE * f
        hf += (head - hf) * arrow[i]
      }
      S.push({
        p: catmull(p0, p1, p2, p3, f),
        w: norm(add(scale(W[i], 1 - f), scale(W[i + 1], f))),
        hw: hwRes[i] + (hwRes[i + 1] - hwRes[i]) * f,
        sw: arrow[i] > 0 ? swRes[i] : swRes[i] + (swRes[i + 1] - swRes[i]) * f,
        half: hf,
        res: i + f,
      })
    }
  }
  S.push({ p: G[N - 1], w: W[N - 1], hw: hwRes[N - 1], sw: swRes[N - 1], half: half(widthF[N - 1]), res: N - 1 })

  // Lit, fogged, outlined quads, back to front.
  const hBack = mix(BG, accent, 0.42)
  const sFront = mix(accent, [232, 236, 234], 0.45)
  const sBack = mix(BG, sFront, 0.45)
  const fadeIn = Math.max(5, N * 0.06)
  type Quad = { z: number; alpha: number; fill: string; edge: string; pts: [number, number][] }
  const quads: Quad[] = []
  for (let k = 0; k < S.length - 1; k++) {
    const A = S[k]
    const B = S[k + 1]
    const alpha = clamp01((reveal - A.res) / fadeIn)
    if (alpha <= 0) break
    const a0 = add(A.p, scale(A.w, A.half)), b0 = sub(A.p, scale(A.w, A.half))
    const a1 = add(B.p, scale(B.w, B.half)), b1 = sub(B.p, scale(B.w, B.half))
    let n = cross(sub(B.p, A.p), add(A.w, B.w))
    const nl = len(n)
    n = nl < 1e-9 ? [0, 0, 1] : scale(n, 1 / nl)
    let isBack = false
    if (n[2] < 0) { n = scale(n, -1); isBack = true }
    const hwv = (A.hw + B.hw) / 2
    const swv = (A.sw + B.sw) / 2
    const sse = Math.min(1, hwv + swv)
    const diff = Math.max(0, dot(n, LIGHT))
    const spec = Math.pow(Math.max(0, dot(n, HALF)), 36) * sse * (isBack ? 0.2 : 1)
    const z = (A.p[2] + B.p[2]) / 2
    const fog = 0.3 + 0.7 * clamp01((z + 1.3) / 2.6)
    const fill: number[] = []
    const edge: number[] = []
    for (let ch = 0; ch < 3; ch++) {
      const hFace = isBack ? hBack[ch] : accent[ch]
      const sFace = isBack ? sBack[ch] : sFront[ch]
      const base = TUBE_RGB[ch] + (hFace - TUBE_RGB[ch]) * hwv + (sFace - TUBE_RGB[ch]) * swv
      const lit = Math.min(255, base * (0.4 + 0.7 * diff) + 255 * 0.55 * spec)
      const col = BG[ch] + (lit - BG[ch]) * fog
      fill.push(Math.round(col))
      edge.push(Math.round(BG[ch] + (col - BG[ch]) * 0.28))
    }
    quads.push({
      z,
      alpha,
      fill: `rgb(${fill.join(',')})`,
      edge: `rgb(${edge.join(',')})`,
      pts: [proj(a0), proj(a1), proj(b1), proj(b0)],
    })
  }
  quads.sort((a, b) => a.z - b.z)

  ctx.lineJoin = 'round'
  ctx.lineCap = 'butt'
  for (const q of quads) {
    const P = q.pts
    ctx.globalAlpha = q.alpha
    // Fill plus a same-colour stroke closes hairline seams between quads.
    ctx.fillStyle = q.fill
    ctx.strokeStyle = q.fill
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1])
    ctx.lineTo(P[2][0], P[2][1]); ctx.lineTo(P[3][0], P[3][1])
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    // Dark outline along the ribbon's two long edges.
    ctx.strokeStyle = q.edge
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1])
    ctx.moveTo(P[3][0], P[3][1]); ctx.lineTo(P[2][0], P[2][1])
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}
