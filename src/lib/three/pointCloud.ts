/**
 * Hero point-cloud geometry and state. Pure maths — no Three.js import, no
 * DOM — so the cycle, the Fibonacci target and the edge topology can be
 * asserted directly in unit tests rather than only observed on screen.
 *
 * Randomness is seeded. Two runs with the same seed produce byte-identical
 * geometry, which is what makes visual comparison between captures
 * meaningful.
 */

/** Node size classes: regular, secondary, hub. */
export const TIER_SCALE = [1, 1.7, 2.6] as const;

export const CYCLE = {
  disorderHold: 3,
  morphToOrder: 3,
  orderHold: 4,
  morphToDisorder: 3,
} as const;

export const CYCLE_TOTAL =
  CYCLE.disorderHold + CYCLE.morphToOrder + CYCLE.orderHold + CYCLE.morphToDisorder; // 13

export const SPHERE_RADIUS = 1.5;
export const CLUSTER_COUNT = 6;
export const DRIFT_AMPLITUDE = 0.08;
export const ELASTIC = 0.014;
export const BREATHING_AMPLITUDE = 0.16;
export const BASE_DOT_SIZE = 0.05;
export const DOT_SIZE_MULTIPLIER = 1.6;

/**
 * MODUS weighting, not the reference's orange/amber/olive. The mandate is
 * explicit that the Antimetal accent trio is not to be carried over and
 * that semantic accents are reserved for where they mean something.
 *
 * ~40% ink (matching the reference's own dark proportion) and the
 * remainder across the MODUS green family. A "colored" node here means a
 * green one — those are the only nodes eligible to carry a signal label,
 * so the colour does mean something: it marks the nodes the system has
 * something to say about.
 */
export const NODE_COLORS = {
  ink: [0.102, 0.086, 0.078], // #1A1614
  green: [0.118, 0.231, 0.18], // #1E3B2E
  mineral: [0.459, 0.608, 0.447], // #759B72
  mid: [0.239, 0.42, 0.322], // #3D6B52 — between the two above
} as const;

/** mulberry32 — small, fast, well-distributed, and deterministic. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller, so clusters are genuinely Gaussian rather than uniform. */
function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Circular ease-in-out, as specified for the morph. */
export function easeInOutCirc(x: number): number {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

/**
 * Raw cycle progress at time `t`, in [0, 1], where 0 is fully disordered
 * and 1 is fully ordered. Unsmoothed — easing is applied per node, after
 * the spatial ripple offset, not here.
 */
export function cycleProgress(t: number): number {
  const p = ((t % CYCLE_TOTAL) + CYCLE_TOTAL) % CYCLE_TOTAL;
  const a = CYCLE.disorderHold;
  const b = a + CYCLE.morphToOrder;
  const c = b + CYCLE.orderHold;
  if (p < a) return 0;
  if (p < b) return (p - a) / CYCLE.morphToOrder;
  if (p < c) return 1;
  return 1 - (p - c) / CYCLE.morphToDisorder;
}

/**
 * Spatial ripple: a node further from the centre starts its morph later,
 * so the cloud organises as a wave rather than all at once.
 */
export function localProgress(raw: number, distanceOffset: number): number {
  return clamp((raw - 0.3 * distanceOffset) / 0.7, 0, 1);
}

/** The ordered target: a radius-1.5 Fibonacci sphere. */
export function fibonacciSphere(i: number, n: number, radius = SPHERE_RADIUS): [number, number, number] {
  const angle = Math.PI * (Math.sqrt(5) - 1);
  const y = 1 - (2 * i) / Math.max(1, n - 1);
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  return [radius * Math.cos(angle * i) * r, radius * y, radius * Math.sin(angle * i) * r];
}

export interface CloudGeometry {
  count: number;
  /** xyz per node, clustered network state. */
  disorder: Float32Array;
  /** xyz per node, Fibonacci sphere state. */
  order: Float32Array;
  /** 0 regular, 1 secondary, 2 hub. */
  tiers: Uint8Array;
  /** rgb per node. */
  colors: Float32Array;
  /** true where the node carries a MODUS green rather than ink. */
  colored: Uint8Array;
  /** Normalised 0..1 distance from the cloud centre, drives the ripple. */
  rippleOffset: Float32Array;
  /** Index pairs for the network edges. */
  edges: Uint32Array;
  clusterOf: Uint8Array;
}

/**
 * Builds both states and the network topology.
 *
 * Edges are sparse and distance-biased, with a small number of
 * inter-cluster links that favour hubs — not every possible connection.
 * Drawing all pairs produces a solid blob and loses the "network" reading
 * entirely, which is the whole point of the disordered state.
 */
export function buildCloud(count: number, seed = 20261001): CloudGeometry {
  const rng = createRng(seed);

  const disorder = new Float32Array(count * 3);
  const order = new Float32Array(count * 3);
  const tiers = new Uint8Array(count);
  const colors = new Float32Array(count * 3);
  const colored = new Uint8Array(count);
  const rippleOffset = new Float32Array(count);
  const clusterOf = new Uint8Array(count);

  // Cluster centres, spread slightly wider horizontally than vertically so
  // the network reads as a landscape rather than a ball.
  //
  // The spread is kept close to the ordered sphere's own radius (1.5) on
  // purpose. A first pass used ±1.8 in x and produced a network that
  // sprawled off the right edge of the viewport and crossed back under the
  // headline — the two states have to occupy roughly the same visual
  // footprint, or the morph reads as the cloud collapsing inward from
  // offscreen rather than reorganising in place.
  const centres: Array<[number, number, number]> = [];
  for (let c = 0; c < CLUSTER_COUNT; c++) {
    centres.push([(rng() - 0.5) * 2.5, (rng() - 0.5) * 2.0, (rng() - 0.5) * 2.0]);
  }

  for (let i = 0; i < count; i++) {
    const c = i % CLUSTER_COUNT;
    clusterOf[i] = c;
    const [cx, cy, cz] = centres[c];
    const spread = 0.42;
    disorder[i * 3] = cx + gaussian(rng) * spread;
    disorder[i * 3 + 1] = cy + gaussian(rng) * spread;
    disorder[i * 3 + 2] = cz + gaussian(rng) * spread;

    const [ox, oy, oz] = fibonacciSphere(i, count);
    order[i * 3] = ox;
    order[i * 3 + 1] = oy;
    order[i * 3 + 2] = oz;

    // Hierarchy: mostly regular, a few secondary, fewer hubs.
    const r = rng();
    tiers[i] = r > 0.93 ? 2 : r > 0.76 ? 1 : 0;

    // ~40% ink, remainder across the green family.
    const cr = rng();
    let col: readonly number[];
    if (cr < 0.4) {
      col = NODE_COLORS.ink;
      colored[i] = 0;
    } else if (cr < 0.62) {
      col = NODE_COLORS.green;
      colored[i] = 1;
    } else if (cr < 0.82) {
      col = NODE_COLORS.mid;
      colored[i] = 1;
    } else {
      col = NODE_COLORS.mineral;
      colored[i] = 1;
    }
    colors[i * 3] = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];
  }

  // Ripple offset from the disordered centroid, normalised to the furthest
  // node so the wave always spans the full 0..1 range regardless of seed.
  let maxDist = 0;
  const dists = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const d = Math.hypot(disorder[i * 3], disorder[i * 3 + 1], disorder[i * 3 + 2]);
    dists[i] = d;
    if (d > maxDist) maxDist = d;
  }
  for (let i = 0; i < count; i++) rippleOffset[i] = maxDist > 0 ? dists[i] / maxDist : 0;

  // --- Edges -------------------------------------------------------------
  const edgeList: number[] = [];
  const seen = new Set<number>();
  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? a * count + b : b * count + a;
    if (seen.has(key)) return;
    seen.add(key);
    edgeList.push(a, b);
  };

  // Local links: each node considers a handful of random candidates and
  // keeps the nearest, which biases towards short edges without the
  // O(n^2) of a full nearest-neighbour pass.
  for (let i = 0; i < count; i++) {
    const links = tiers[i] === 2 ? 3 : tiers[i] === 1 ? 2 : 1;
    for (let l = 0; l < links; l++) {
      let best = -1;
      let bestD = Infinity;
      for (let k = 0; k < 6; k++) {
        const j = Math.floor(rng() * count);
        if (j === i || clusterOf[j] !== clusterOf[i]) continue;
        const d = Math.hypot(
          disorder[i * 3] - disorder[j * 3],
          disorder[i * 3 + 1] - disorder[j * 3 + 1],
          disorder[i * 3 + 2] - disorder[j * 3 + 2]
        );
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      if (best >= 0) addEdge(i, best);
    }
  }

  // A limited number of inter-cluster edges, preferring hubs at both ends,
  // so the clusters read as one loose network rather than six islands.
  const hubs: number[] = [];
  for (let i = 0; i < count; i++) if (tiers[i] >= 1) hubs.push(i);
  // Deliberately few. These are the longest edges in the scene, and at 6%
  // of the node count they turned the field into a web of long diagonals
  // that read louder than the dots. The reference's inter-cluster links
  // are occasional punctuation, not structure.
  const interCount = Math.max(3, Math.round(count * 0.025));
  for (let n = 0; n < interCount && hubs.length > 1; n++) {
    const a = hubs[Math.floor(rng() * hubs.length)];
    const b = hubs[Math.floor(rng() * hubs.length)];
    if (clusterOf[a] !== clusterOf[b]) addEdge(a, b);
  }

  return {
    count,
    disorder,
    order,
    tiers,
    colors,
    colored,
    rippleOffset,
    edges: new Uint32Array(edgeList),
    clusterOf,
  };
}

/**
 * Per-node lifecycle: grow 1s, hold 2–5s, shrink 1s, gap 0.4–2s. Returns a
 * 0..1 scale. A node at 0 is genuinely absent — that is intentional in the
 * reference, not a dropped frame.
 */
export interface Lifecycle {
  phase: 0 | 1 | 2 | 3; // grow, hold, shrink, gap
  until: number;
  scale: number;
}

export function createLifecycles(count: number, rng: () => number, now: number): Lifecycle[] {
  const out: Lifecycle[] = [];
  for (let i = 0; i < count; i++) {
    // Staggered start so they do not all pulse in unison on first frame.
    out.push({ phase: 1, until: now + 2 + rng() * 5, scale: 1 });
  }
  return out;
}

export function advanceLifecycle(l: Lifecycle, now: number, rng: () => number): void {
  if (now < l.until) {
    if (l.phase === 0) l.scale = 1 - (l.until - now) / 1;
    else if (l.phase === 2) l.scale = (l.until - now) / 1;
    else if (l.phase === 1) l.scale = 1;
    else l.scale = 0;
    l.scale = clamp(l.scale, 0, 1);
    return;
  }
  switch (l.phase) {
    case 0:
      l.phase = 1;
      l.until = now + 2 + rng() * 3;
      l.scale = 1;
      break;
    case 1:
      l.phase = 2;
      l.until = now + 1;
      break;
    case 2:
      l.phase = 3;
      l.until = now + 0.4 + rng() * 1.6;
      l.scale = 0;
      break;
    default:
      l.phase = 0;
      l.until = now + 1;
      l.scale = 0;
  }
}
