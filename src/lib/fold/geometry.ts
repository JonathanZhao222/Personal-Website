import type { ProteinEntry } from './proteins'

export type V = [number, number, number]

export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s]
export const len = (a: V) => Math.hypot(a[0], a[1], a[2])
export const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const norm = (a: V): V => scale(a, 1 / (len(a) || 1))
export const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const centroid = (pts: V[]): V =>
  scale(pts.reduce((a, p) => add(a, p), [0, 0, 0] as V), 1 / pts.length)

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
export const smooth = (t: number) => {
  t = clamp01(t)
  return t * t * (3 - 2 * t)
}

export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface FoldModel {
  N: number
  /** Native Cα trace, centred, scaled so the 95th-percentile radius is 0.85. */
  folded: V[]
  /** Starting conformation: a smooth, meandering, softly confined thread. */
  denatured: V[]
  ss: string[]
  /** Model units per Å. */
  sc: number
}

export function buildModel(entry: ProteinEntry): FoldModel {
  const N = entry.ss.length
  const raw: V[] = []
  for (let k = 0; k < N; k++) {
    raw.push([entry.xyz[3 * k] / 10, entry.xyz[3 * k + 1] / 10, entry.xyz[3 * k + 2] / 10])
  }
  const c0 = centroid(raw)
  const centered = raw.map((p) => sub(p, c0))
  const radii = centered.map(len).sort((a, b) => a - b)
  const sc = 0.85 / radii[Math.floor(N * 0.95)]
  const folded = centered.map((p) => scale(p, sc))

  // Mean Cα–Cα bond, ignoring chain breaks.
  let bond = 0
  let nb = 0
  for (let k = 1; k < N; k++) {
    const d = len(sub(raw[k], raw[k - 1]))
    if (d < 4.2) { bond += d; nb++ }
  }
  bond = (bond / Math.max(1, nb)) * sc

  // Denatured start: a slowly turning direction field, pulled back inside an ellipsoid.
  const drand = mulberry32(0x91c3 + N)
  const ph = [0, 0, 0, 0, 0].map(() => drand() * 2 * Math.PI) // 5 draws keeps the seed sequence as designed
  const R0 = 1.6 + 0.5 * Math.min(1.5, (N * bond) / 30)
  const den: V[] = [[0, 0, 0]]
  let az = drand() * 2 * Math.PI
  let el = 0
  for (let k = 1; k < N; k++) {
    const s = k * bond
    az += bond * (1.25 * Math.sin(0.55 * s + ph[0]) + 0.7 * Math.sin(1.7 * s + ph[1]))
    el += bond * (0.9 * Math.sin(0.43 * s + ph[2]) + 0.5 * Math.sin(1.3 * s + ph[3]))
    el = Math.max(-1.2, Math.min(1.2, el))
    let d: V = [Math.cos(az) * Math.cos(el), Math.sin(el) * 0.8, Math.sin(az) * Math.cos(el)]
    const p = den[k - 1]
    const r = len([p[0] / 1.6, p[1], p[2]])
    if (r > R0 * 0.6) {
      d = norm(add(d, scale(norm([-p[0], -p[1] * 1.6, -p[2]]), ((r - R0 * 0.6) / R0) * 2.2)))
    }
    den.push(add(p, scale(norm(d), bond)))
  }
  const dc = centroid(den)
  const denatured = den.map((p) => sub(p, dc))

  return { N, folded, denatured, ss: entry.ss.split(''), sc }
}

export function catmull(p0: V, p1: V, p2: V, p3: V, t: number): V {
  const t2 = t * t
  const t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])]
}

export type Quat = [number, number, number, number]

/**
 * Horn's quaternion method: the rotation that best superimposes B onto A
 * (both centred internally), found by power iteration on Horn's 4×4 matrix.
 * Pass the previous `q` with few `iters` to warm-start frame to frame.
 */
export function horn(A: V[], B: V[], q0: Quat | null, iters: number) {
  const n = A.length
  const ca = centroid(A)
  const cb = centroid(B)
  let G = 0
  const S = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let i = 0; i < n; i++) {
    const a = sub(A[i], ca)
    const b = sub(B[i], cb)
    G += dot(a, a) + dot(b, b)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r * 3 + c] += b[r] * a[c]
  }
  const [xx, xy, xz, yx, yy, yz, zx, zy, zz] = S
  const M = [
    [xx + yy + zz, yz - zy, zx - xz, xy - yx],
    [yz - zy, xx - yy - zz, xy + yx, zx + xz],
    [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
    [xy - yx, zx + xz, yz + zy, -xx - yy + zz],
  ]
  const shift = G / 2
  let q: Quat = q0 ?? [1, 0.5, 0.3, 0.2]
  let lam = 0
  for (let it = 0; it < iters; it++) {
    const nq: Quat = [0, 0, 0, 0]
    for (let r = 0; r < 4; r++) {
      nq[r] = shift * q[r]
      for (let c = 0; c < 4; c++) nq[r] += M[r][c] * q[c]
    }
    const l = Math.hypot(nq[0], nq[1], nq[2], nq[3]) || 1
    lam = l - shift
    q = nq.map((v) => v / l) as Quat
  }
  return { q, lam, G, n, ca, cb }
}

export function qrot(q: Quat, v: V): V {
  const [w, x, y, z] = q
  const tx = 2 * (y * v[2] - z * v[1])
  const ty = 2 * (z * v[0] - x * v[2])
  const tz = 2 * (x * v[1] - y * v[0])
  return [
    v[0] + w * tx + (y * tz - z * ty),
    v[1] + w * ty + (z * tx - x * tz),
    v[2] + w * tz + (x * ty - y * tx),
  ]
}

/** RMSD after optimal superposition. */
export function rmsd(A: V[], B: V[]) {
  const h = horn(A, B, null, 80)
  return Math.sqrt(Math.max(0, (h.G - 2 * h.lam) / h.n))
}
