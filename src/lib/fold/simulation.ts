import type { ProteinEntry } from './proteins'
import {
  type FoldModel,
  type Quat,
  type V,
  add,
  buildModel,
  centroid,
  clamp01,
  dot,
  horn,
  len,
  qrot,
  rmsd,
  smooth,
  sub,
} from './geometry'

export const SUBSTEP = 1 / 120 // s per physics step
const DAMP = 0.94
/** s spent melting back to the denatured state before a refold. */
export const MELT = 1.1

interface Segment { a: number; b: number; start: number; q?: Quat }

/**
 * A structure-based ("Gō-like") folding toy: the chain is steered from its
 * denatured thread toward the native PDB structure while helices coil by shape
 * matching, native contacts form, strands pair, and thermal noise cools off.
 *
 * Progress is `tau`: < 0 melting, 0→1 folding, ≥ 1 native.
 */
export class FoldSimulation {
  readonly m: FoldModel
  readonly N: number
  /** Current positions (model units). */
  x: V[]
  private v: V[]
  private p: V[]
  private noise: V[]
  readonly helixOf: Int16Array
  readonly helices: Segment[] = []
  /** Helix formation weight per helix, 0→1. */
  readonly hw: Float32Array
  readonly strandOf: Int16Array
  readonly strands: Segment[] = []
  /** Strand formation weight per strand, 0→1. */
  readonly sw: Float32Array
  private bonds: [number, number, number][] = []
  private contacts: [number, number, number, number][] = []
  private minSep: number
  private sep: Float32Array
  /** RMS radius of the native structure. */
  readonly rNative: number

  constructor(entry: ProteinEntry) {
    const m = buildModel(entry)
    this.m = m
    const N = m.N
    this.N = N
    this.x = m.denatured.map((p) => [...p] as V)
    this.v = this.x.map(() => [0, 0, 0])
    this.p = this.x.map(() => [0, 0, 0])
    this.noise = this.x.map(() => [0, 0, 0])

    this.helixOf = new Int16Array(N).fill(-1)
    for (let k = 0; k < N; k++) {
      if (m.ss[k] !== 'H') continue
      if (k === 0 || m.ss[k - 1] !== 'H') this.helices.push({ a: k, b: k, start: 0 })
      this.helices[this.helices.length - 1].b = k
      this.helixOf[k] = this.helices.length - 1
    }
    const nH = this.helices.length
    this.helices.forEach((h, j) => { h.start = 0.08 + 0.26 * (nH > 1 ? j / (nH - 1) : 0) })
    this.hw = new Float32Array(nH)

    const F = m.folded
    const d = (i: number, j: number) => len(sub(F[i], F[j]))
    for (let i = 0; i < N - 1; i++) this.bonds.push([i, i + 1, d(i, i + 1)])

    // Strands only become sheets once their partners arrive during collapse.
    this.strandOf = new Int16Array(N).fill(-1)
    const strands: Segment[] = []
    for (let k = 0; k < N; k++) {
      if (m.ss[k] !== 'E') continue
      if (k === 0 || m.ss[k - 1] !== 'E') strands.push({ a: k, b: k, start: 0 })
      strands[strands.length - 1].b = k
    }
    this.strands = strands.filter((st) => st.b - st.a >= 1)
    this.strands.forEach((st, j) => {
      st.start = 0.42 + 0.26 * (st.a / N)
      for (let i = st.a; i <= st.b; i++) this.strandOf[i] = j
    })
    this.sw = new Float32Array(this.strands.length)

    // Native contacts (≤ 8.5 Å, |i−j| ≥ 4, not within one helix); long-range ones form later.
    const cut = 8.5 * m.sc
    for (let i = 0; i < N; i++) {
      for (let j = i + 4; j < N; j++) {
        if (this.helixOf[i] >= 0 && this.helixOf[i] === this.helixOf[j]) continue
        const r = d(i, j)
        if (r < cut) this.contacts.push([i, j, r, 0.36 + 0.3 * ((j - i) / N)])
      }
    }

    this.minSep = 4.0 * m.sc
    this.sep = new Float32Array(N * N)
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) this.sep[i * N + j] = Math.min(this.minSep, 0.95 * d(i, j))
    }

    let rn = 0
    for (const p of F) rn += dot(p, p) / N
    this.rNative = Math.sqrt(rn)
  }

  /** Jump straight to the native state (reduced motion). */
  settle() {
    this.x = this.m.folded.map((q) => [...q] as V)
    this.hw.fill(1)
    this.sw.fill(1)
  }

  private temperature(tau: number) {
    return tau < 0 ? 0.6 : 0.02 + 0.38 * Math.pow(1 - clamp01(tau), 1.6)
  }

  // Docking sweeps from the N- to the C-terminus, so the chain zips itself into place.
  private steerK(tau: number, f: number) {
    return tau < 0
      ? 14
      : 3 * smooth((tau - 0.1 - 0.35 * f) / 0.2) + 24 * smooth((tau - 0.22 - 0.42 * f) / 0.42)
  }

  step(tau: number) {
    const { N, x, v, p, noise } = this
    const F = this.m.folded
    const T = this.temperature(tau)
    const target = tau < 0 ? this.m.denatured : F
    const kick = 1.1 * T

    for (let i = 0; i < N; i++) {
      const vi = v[i]
      const xi = x[i]
      const ti = target[i]
      const kS = this.steerK(tau, i / N)
      const nz = noise[i]
      for (let a = 0; a < 3; a++) {
        nz[a] = nz[a] * 0.96 + (Math.random() * 2 - 1) * 0.04
        vi[a] = vi[a] * DAMP + nz[a] * kick + kS * (ti[a] - xi[a]) * SUBSTEP
        p[i][a] = xi[a] + vi[a] * SUBSTEP
      }
    }

    this.helices.forEach((h, j) => { this.hw[j] = tau < 0 ? 0 : smooth((tau - h.start) / 0.2) })
    this.strands.forEach((st, j) => { this.sw[j] = tau < 0 ? 0 : smooth((tau - st.start) / 0.2) })

    // Helix formation by shape matching: chirality-safe, so every helix coils right-handed.
    this.helices.forEach((h, j) => {
      const w = this.hw[j]
      if (w <= 0) return
      const cur = p.slice(h.a, h.b + 1)
      const nat = F.slice(h.a, h.b + 1)
      const r = horn(cur, nat, h.q ?? null, h.q ? 8 : 60)
      h.q = r.q
      for (let i = h.a; i <= h.b; i++) {
        const g = add(qrot(r.q, sub(nat[i - h.a], r.cb)), r.ca)
        for (let a = 0; a < 3; a++) p[i][a] += (g[a] - p[i][a]) * 0.12 * w
      }
    })

    const relax = (i: number, j: number, rest: number, c: number) => {
      const pi = p[i]
      const pj = p[j]
      const dx = pj[0] - pi[0], dy = pj[1] - pi[1], dz = pj[2] - pi[2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
      const f = ((dist - rest) / dist) * c
      pi[0] += dx * f; pi[1] += dy * f; pi[2] += dz * f
      pj[0] -= dx * f; pj[1] -= dy * f; pj[2] -= dz * f
    }

    for (let it = 0; it < 3; it++) {
      if (tau >= 0) {
        const late = 1 - smooth((tau - 0.6) / 0.25)
        for (const [i, j, r, s] of this.contacts) {
          const w = smooth((tau - s) / 0.18) * late
          if (w > 0) relax(i, j, r, 0.006 * w)
        }
      }
      // Excluded volume, never pushing apart pairs that touch in the native state.
      const ms2 = this.minSep * this.minSep
      const ev = tau < 0 ? 0.5 : 0.5 * (1 - smooth((tau - 0.55) / 0.25))
      for (let i = 0; i < N; i++) {
        const pi = p[i]
        for (let j = i + 3; j < N; j++) {
          const pj = p[j]
          const dx = pj[0] - pi[0], dy = pj[1] - pi[1], dz = pj[2] - pi[2]
          const d2 = dx * dx + dy * dy + dz * dz
          if (d2 >= ms2 || d2 === 0) continue
          const mij = this.sep[i * N + j]
          if (d2 >= mij * mij) continue
          const dist = Math.sqrt(d2)
          const f = ((dist - mij) / dist) * ev
          pi[0] += dx * f; pi[1] += dy * f; pi[2] += dz * f
          pj[0] -= dx * f; pj[1] -= dy * f; pj[2] -= dz * f
        }
      }
      for (const [i, j, r] of this.bonds) relax(i, j, r, 0.5)
    }

    if (tau > 0.5) {
      for (let i = 0; i < N; i++) {
        const settle = 0.1 * smooth((tau - 0.55 - 0.32 * (i / N)) / 0.25)
        if (settle > 0) for (let a = 0; a < 3; a++) p[i][a] += (F[i][a] - p[i][a]) * settle
      }
    }

    for (let i = 0; i < N; i++) {
      for (let a = 0; a < 3; a++) {
        v[i][a] = (p[i][a] - x[i][a]) / SUBSTEP
        x[i][a] = p[i][a]
      }
    }
  }

  /** Stage label, radius of gyration and RMSD to native, both in Å. */
  stats(tau: number) {
    const c = centroid(this.x)
    let rg = 0
    for (const q of this.x) {
      const d = sub(q, c)
      rg += dot(d, d) / this.N
    }
    const stage =
      tau < 0 ? 'melting'
        : tau < 0.1 ? 'denatured'
          : tau < 0.36 ? '2° · helices forming'
            : tau < 0.95 ? '3° · collapse'
              : 'native state'
    return {
      stage,
      rg: Math.sqrt(rg) / this.m.sc,
      rmsd: rmsd(this.x, this.m.folded) / this.m.sc,
    }
  }
}
