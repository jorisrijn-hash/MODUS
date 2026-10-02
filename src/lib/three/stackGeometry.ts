/**
 * Architecture-stack layout. Pure data — the reference's own 1512×1219
 * coordinate system, converted into centred world coordinates.
 *
 * Kept separate from scene construction and from the scroll controller on
 * purpose: this is the part worth asserting in a test, and the part that
 * changes when the content changes.
 */

export const REF_WIDTH = 1512;
export const REF_HEIGHT = 1219;
export const BOX_DEPTH = 320;
export const FRONT_Z = 160;
/** Ground-coloured occluder. Hidden fronts sit at −240, behind it. */
export const OCCLUSION_Z = -185;
export const HIDDEN_Z = -400;
export const PRODUCTION_OFFSET = 601;

export interface StackRect {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Dictionary path for the heading, resolved by the component. */
  headingKey: string;
  supportKey?: string;
  kind: "panel" | "glyph" | "cell";
}

/**
 * Five MODUS business categories replace the reference's nine integration
 * logos. The row is refitted deliberately rather than leaving nine slots
 * with four empty, and no Antimetal provider logo is used or implied:
 *
 *   available width 1272, four 20-unit gaps
 *   cell = (1272 − 4×20) / 5 = 238.4
 *   x    = 120 + i × (238.4 + 20)
 *
 * Outer alignment with the 1272-wide panels above and below is preserved,
 * which is the property that made the original row read as part of the
 * same diagram.
 */
export const CATEGORY_COUNT = 5;
export const CATEGORY_GAP = 20;
export const CATEGORY_WIDTH = (1272 - (CATEGORY_COUNT - 1) * CATEGORY_GAP) / CATEGORY_COUNT; // 238.4

export const CATEGORY_IDS = ["sales", "operations", "finance", "service", "tools"] as const;

export const STACK_RECTS: StackRect[] = [
  { id: "team", left: 120, top: 80, width: 1272, height: 214, headingKey: "team", supportKey: "team", kind: "panel" },
  { id: "improvements", left: 120, top: 314, width: 804, height: 214, headingKey: "improvements", supportKey: "improvements", kind: "panel" },
  { id: "insight", left: 120, top: 548, width: 804, height: 214, headingKey: "insight", supportKey: "insight", kind: "panel" },
  { id: "identity", left: 944, top: 314, width: 448, height: 448, headingKey: "identity", kind: "glyph" },
  ...CATEGORY_IDS.map((id, i) => ({
    id: `category-${id}`,
    left: 120 + i * (CATEGORY_WIDTH + CATEGORY_GAP),
    top: 782,
    width: CATEGORY_WIDTH,
    height: 123,
    headingKey: `category.${id}`,
    kind: "cell" as const,
  })),
  { id: "production", left: 120, top: 925, width: 1272, height: 214, headingKey: "production", supportKey: "production", kind: "panel" },
];

/** Top-left reference coordinates → centred world coordinates. */
export function toWorld(rect: Pick<StackRect, "left" | "top" | "width" | "height">): {
  x: number;
  y: number;
} {
  return {
    x: rect.left + rect.width / 2 - REF_WIDTH / 2,
    y: REF_HEIGHT / 2 - 0.5 - (rect.top + rect.height / 2),
  };
}

/**
 * World-space half-extents of the ACTUAL geometry, computed from the rects
 * rather than assumed from the reference frame.
 *
 * The fit used to be the full 1512x1219 reference canvas, but the panels
 * only occupy 1272x1059 of it — the rest is the study's own page padding.
 * Fitting to the padded frame meant the diagram rendered about 19% smaller
 * than it needed to and left a wide empty border, which is why enlarging
 * the container alone never made the scene look bigger.
 */
function contentHalfExtents(): { halfW: number; halfH: number } {
  let halfW = 0;
  let halfH = 0;
  for (const r of STACK_RECTS) {
    const { x, y } = toWorld(r);
    halfW = Math.max(halfW, Math.abs(x) + r.width / 2);
    halfH = Math.max(halfH, Math.abs(y) + r.height / 2);
  }
  return { halfW, halfH };
}

/**
 * Margin around that content.
 *
 * It has to survive the most demanding state, not the flat one. At maximum
 * tilt (root X -0.48 rad, Y -0.36 rad) a box of depth 320 swings its own
 * corners outward, so the projected extent grows by roughly
 * `halfDepth * sin(angle)` while the face shrinks by `cos(angle)`:
 *
 *   x: 636*cos(0.36) + 160*sin(0.36) ~= 651   (vs 636 flat)
 *   y: 529.5*cos(0.48) + 160*sin(0.48) ~= 544 (vs 529.5 flat)
 *
 * So the tilted state needs about 3% more room than the flat one. 1.12
 * covers that with headroom left over for the projected HTML labels that
 * sit just outside the panels.
 */
export const FIT_MARGIN = 1.12;

/**
 * Orthographic frustum that fits the real geometry with that margin.
 * Which dimension binds depends on the viewport aspect — getting this
 * backwards crops the diagram instead of letterboxing it.
 */
export function fitFrustum(viewportAspect: number): {
  halfWidth: number;
  halfHeight: number;
} {
  const { halfW, halfH } = contentHalfExtents();
  const contentAspect = halfW / halfH;
  if (viewportAspect > contentAspect) {
    const halfHeight = FIT_MARGIN * halfH;
    return { halfHeight, halfWidth: halfHeight * viewportAspect };
  }
  const halfWidth = FIT_MARGIN * halfW;
  return { halfWidth, halfHeight: halfWidth / viewportAspect };
}

/** Which rects start hidden at Z = −400 rather than at Z = 0. */
export function startsHidden(id: string): boolean {
  return id !== "team" && id !== "production";
}
