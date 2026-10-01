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
/** 12% breathing room around the reference frame. */
export const FIT_MARGIN = 1.12;

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
 * Orthographic frustum that fits the reference frame with 12% margin.
 * Which dimension binds depends on the viewport aspect — getting this
 * backwards crops the diagram instead of letterboxing it.
 */
export function fitFrustum(viewportAspect: number): {
  halfWidth: number;
  halfHeight: number;
} {
  if (viewportAspect > REF_WIDTH / REF_HEIGHT) {
    const halfHeight = (FIT_MARGIN * REF_HEIGHT) / 2;
    return { halfHeight, halfWidth: halfHeight * viewportAspect };
  }
  const halfWidth = (FIT_MARGIN * REF_WIDTH) / 2;
  return { halfWidth, halfHeight: halfWidth / viewportAspect };
}

/** Which rects start hidden at Z = −400 rather than at Z = 0. */
export function startsHidden(id: string): boolean {
  return id !== "team" && id !== "production";
}
