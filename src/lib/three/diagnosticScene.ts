import { createRng, fibonacciSphere } from "./pointCloud";

/**
 * Geometry for the diagnostic's sphere -> layers -> stack -> closure
 * sequence.
 *
 * Pure maths, no Three.js and no DOM, so the state mapping can be asserted
 * in tests rather than only looked at.
 *
 * One cloud of points with PERSISTENT identities throughout: the same
 * point that sits on the entry sphere becomes a point in a topic layer and
 * then a point in the settled mark. Nothing is torn down and rebuilt
 * between stages, which is what makes the four states read as one object
 * being reorganised rather than four unrelated illustrations.
 */

export type DiagnosticStage =
  | { kind: "sphere" }
  /** Exploded layers, with one topic emphasised. */
  | { kind: "layers"; activeLayer: number }
  /** Aligned, composed stack — answers ready for review. */
  | { kind: "stack" }
  /** Compact closure around the MODUS mark. Only after real persistence. */
  | { kind: "settled" };

export const POINT_COUNT = 420;
/** One plane per diagnostic step. Derived, never hardcoded ahead of the schema. */
export const DEFAULT_LAYERS = 6;

export interface DiagnosticCloud {
  count: number;
  layers: number;
  /** Which topic layer each point belongs to. */
  layerOf: Uint8Array;
  /** xyz on the entry sphere. */
  sphere: Float32Array;
  /** xyz in the exploded layer planes. */
  exploded: Float32Array;
  /** xyz in the aligned review stack. */
  stack: Float32Array;
  /** xyz in the settled closing composition. */
  settled: Float32Array;
}

/** Points per plane, laid out as a jittered grid so a layer reads as a surface. */
function planePoint(i: number, perLayer: number, rng: () => number, spread: number) {
  const cols = Math.ceil(Math.sqrt(perLayer));
  const col = i % cols;
  const row = Math.floor(i / cols);
  const u = (col / (cols - 1) - 0.5) * 2;
  const v = (row / (cols - 1) - 0.5) * 2;
  // Jitter keeps it from reading as graph paper.
  return [u * spread + (rng() - 0.5) * 0.08, v * spread * 0.55 + (rng() - 0.5) * 0.06];
}

export function buildDiagnosticCloud(
  layers = DEFAULT_LAYERS,
  count = POINT_COUNT,
  seed = 20261002
): DiagnosticCloud {
  const rng = createRng(seed);
  const layerOf = new Uint8Array(count);
  const sphere = new Float32Array(count * 3);
  const exploded = new Float32Array(count * 3);
  const stack = new Float32Array(count * 3);
  const settled = new Float32Array(count * 3);

  const perLayer = Math.floor(count / layers);

  for (let i = 0; i < count; i++) {
    const layer = Math.min(layers - 1, Math.floor(i / perLayer));
    layerOf[i] = layer;
    const withinLayer = i - layer * perLayer;

    // --- entry: an uneven sphere -------------------------------------
    // Deliberately not a clean Fibonacci shell: the entry state means
    // "scattered information", so each point is pushed off the shell by a
    // seeded amount. Still a sphere, still volumetric, but unresolved.
    const [sx, sy, sz] = fibonacciSphere(i, count, 1.0);
    const wobble = 0.82 + rng() * 0.46;
    sphere[i * 3] = sx * wobble;
    sphere[i * 3 + 1] = sy * wobble;
    sphere[i * 3 + 2] = sz * wobble;

    // --- questions: separated topic planes ---------------------------
    const [px, pz] = planePoint(withinLayer, perLayer, rng, 1.25);
    const gap = 0.46;
    const yExploded = (layers / 2 - layer - 0.5) * gap;
    exploded[i * 3] = px;
    exploded[i * 3 + 1] = yExploded;
    exploded[i * 3 + 2] = pz;

    // --- review: the same planes drawn together ----------------------
    const tight = 0.17;
    stack[i * 3] = px * 0.86;
    stack[i * 3 + 1] = (layers / 2 - layer - 0.5) * tight;
    stack[i * 3 + 2] = pz * 0.86;

    // --- success: compact closure around the mark --------------------
    // Points gather onto the mark's own geometry — a centre square and
    // four detached bars — so the closing composition is the MODUS mark
    // assembled out of the visitor's own answers.
    settled.set(markPoint(i, count, rng), i * 3);
  }

  return { count, layers, layerOf, sphere, exploded, stack, settled };
}

/**
 * Distributes points over the MODUS mark: a centre square plus four
 * detached orthogonal bars. Proportions match the SVG and the 3D panel, so
 * the closure is recognisably the mark rather than a generic cluster.
 */
function markPoint(i: number, count: number, rng: () => number): [number, number, number] {
  const S = 1.15; // overall scale
  const slot = i % 5;
  const j = (v: number) => (rng() - 0.5) * v;
  const z = j(0.06);
  switch (slot) {
    case 0: // centre square
      return [j(0.26) * S, j(0.26) * S, z];
    case 1: // top bar
      return [j(0.1) * S, (0.3 + rng() * 0.33) * S, z];
    case 2: // bottom bar
      return [j(0.1) * S, -(0.3 + rng() * 0.33) * S, z];
    case 3: // left bar
      return [-(0.3 + rng() * 0.33) * S, j(0.1) * S, z];
    default: // right bar
      return [(0.3 + rng() * 0.33) * S, j(0.1) * S, z];
  }
}

/** Target buffer for a stage. */
export function targetsFor(cloud: DiagnosticCloud, stage: DiagnosticStage): Float32Array {
  switch (stage.kind) {
    case "sphere":
      return cloud.sphere;
    case "layers":
      return cloud.exploded;
    case "stack":
      return cloud.stack;
    case "settled":
      return cloud.settled;
  }
}

/**
 * Per-point emphasis in 0..1.
 *
 * The active topic is brought forward, completed topics stay quietly
 * visible, and later topics are subdued — so the scene says where the
 * visitor is without claiming anything about their business.
 */
export function emphasisFor(cloud: DiagnosticCloud, stage: DiagnosticStage, i: number): number {
  if (stage.kind !== "layers") return 1;
  const layer = cloud.layerOf[i];
  if (layer === stage.activeLayer) return 1;
  return layer < stage.activeLayer ? 0.55 : 0.22;
}

/** Maps the diagnostic's own screen/step model onto a stage. */
export function stageFor(screen: string, step: number, layers = DEFAULT_LAYERS): DiagnosticStage {
  switch (screen) {
    case "form":
      return { kind: "layers", activeLayer: Math.min(layers - 1, Math.max(0, step)) };
    case "review":
    // Submitting holds the review structure: nothing may anticipate
    // success before the server has confirmed persistence.
    case "submitting":
    // A failed submission stays in the review structure too.
    case "submit_error":
      return { kind: "stack" };
    case "result":
    case "profile":
      return { kind: "settled" };
    default:
      return { kind: "sphere" };
  }
}
