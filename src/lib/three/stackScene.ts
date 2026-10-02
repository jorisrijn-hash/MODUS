import * as THREE from "three";
import {
  BOX_DEPTH,
  FRONT_Z,
  HIDDEN_Z,
  OCCLUSION_Z,
  PRODUCTION_OFFSET,
  STACK_RECTS,
  fitFrustum,
  startsHidden,
  toWorld,
  type StackRect,
} from "./stackGeometry";

export interface StackPalette {
  ground: string;
  ink: string;
  muted: string;
  green: string;
  cream: string;
}

export interface StackLabels {
  heading: Record<string, string>;
  support: Record<string, string>;
}

/** Live handles the scroll timeline animates. Plain numbers, mutated in place. */
export interface StackState {
  rotationX: number;
  rotationY: number;
  productionOffset: number;
  /** Local Z per rect id. */
  z: Record<string, number>;
}

export interface StackScene {
  state: StackState;
  /** Push `state` onto the scene graph and draw one frame. */
  apply(): void;
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}

/**
 * Draws one panel face into a canvas texture: the dashed frame, the four
 * solid corner marks and the type.
 *
 * A texture rather than in-scene text geometry because it keeps type crisp
 * at any camera fit, needs no font loader, and lets the frame treatment be
 * drawn with the exact same dash/corner language as the DOM `BracketFrame`
 * — so the 3D diagram and the story cards beside it agree.
 *
 * `document.fonts.ready` must be awaited before calling this, or the
 * textures bake with a fallback face and never update.
 */
function panelTexture(
  rect: StackRect,
  labels: StackLabels,
  palette: StackPalette
): THREE.CanvasTexture {
  // World units → texture pixels. 1.6 keeps headings (36 world units)
  // comfortably above 50px in the texture, which stays crisp under the
  // orthographic fit without producing absurd texture sizes.
  const s = 1.6;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(rect.width * s);
  canvas.height = Math.round(rect.height * s);
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (rect.kind === "glyph") {
    // The MODUS mark with ample negative space, drawn procedurally from
    // the same proportions as the supplied raster rather than loaded as an
    // image — no async asset, no CORS, no texture-ready race.
    // Bare mark, no tile: the green rounded square that used to sit
    // behind this glyph is gone, matching the DOM logo. The geometry is
    // drawn in ink directly on the panel surface.
    const size = Math.min(canvas.width, canvas.height) * 0.42;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const u = size / 100;
    const x0 = cx - size / 2;
    const y0 = cy - size / 2;
    ctx.fillStyle = palette.ink;
    ctx.fillRect(x0 + 43 * u, y0 + 43 * u, 14 * u, 14 * u);
    ctx.fillRect(x0 + 47.5 * u, y0 + 16 * u, 5 * u, 22 * u);
    ctx.fillRect(x0 + 47.5 * u, y0 + 62 * u, 5 * u, 22 * u);
    ctx.fillRect(x0 + 16 * u, y0 + 47.5 * u, 22 * u, 5 * u);
    ctx.fillRect(x0 + 62 * u, y0 + 47.5 * u, 22 * u, 5 * u);

    ctx.fillStyle = palette.ink;
    ctx.font = `500 ${Math.round(22 * s)}px "Geist", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.letterSpacing = `${Math.round(4 * s)}px`;
    ctx.fillText("MODUS", cx, cy + size / 2 + 48 * s);
  } else {
    // Dashed frame.
    ctx.strokeStyle = palette.muted;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([3 * s, 2.5 * s]);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Four solid corner marks: length 9 world units, width 1.6.
    const L = 9 * s;
    const w = 1.6 * s;
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = w;
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    const corners: Array<[number, number, number, number]> = [
      [0, 0, 1, 1],
      [canvas.width, 0, -1, 1],
      [canvas.width, canvas.height, -1, -1],
      [0, canvas.height, 1, -1],
    ];
    for (const [x, y, sx, sy] of corners) {
      ctx.beginPath();
      ctx.moveTo(x + sx * w / 2, y + sy * L);
      ctx.lineTo(x + sx * w / 2, y + sy * w / 2);
      ctx.lineTo(x + sx * L, y + sy * w / 2);
      ctx.stroke();
    }

    const heading = labels.heading[rect.headingKey] ?? "";
    const support = rect.supportKey ? labels.support[rect.supportKey] ?? "" : "";

    const padX = 28 * s;
    if (rect.kind === "cell") {
      // Category cells: one centred sans label, no serif heading — they
      // are a row of equals, not six more titled panels.
      ctx.fillStyle = palette.ink;
      ctx.font = `500 ${Math.round(20 * s)}px "Geist", system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(heading, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = palette.ink;
      // Headings ≈36 world units, serif.
      ctx.font = `400 ${Math.round(36 * s)}px "Noto Serif", Georgia, serif`;
      ctx.fillText(heading, padX, canvas.height / 2 + 2 * s);
      // Support ≈20 world units, sans, 60% opacity.
      ctx.globalAlpha = 0.6;
      ctx.font = `400 ${Math.round(20 * s)}px "Geist", system-ui, sans-serif`;
      ctx.fillText(support, padX, canvas.height / 2 + 32 * s);
      ctx.globalAlpha = 1;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export function createStackScene(
  canvas: HTMLCanvasElement,
  labels: StackLabels,
  palette: StackPalette
): StackScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null;
  }
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  // Orthographic: a box pushed in Z keeps its on-screen size, so depth
  // reads as occlusion and parallax-free emergence rather than as scaling.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
  camera.position.set(0, 0, 1000);

  const root = new THREE.Group();
  scene.add(root);

  // Occlusion plane, INSIDE the root group. Keeping it inside is what
  // makes the hidden state reliable: occlusion then depends only on local
  // Z, so a panel whose front sits at −240 is behind the plane at −185
  // regardless of how far the root has tilted. A world-fixed plane breaks
  // this — under the −0.36rad Y tilt a 1272-wide panel's own ends sweep
  // through ±224 of world Z and part of it pokes through.
  const occluder = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(palette.ground) })
  );
  occluder.position.z = OCCLUSION_Z;
  root.add(occluder);

  const disposables: Array<{ dispose(): void }> = [occluder.geometry, occluder.material];
  const groups: Record<string, THREE.Group> = {};
  const baseY: Record<string, number> = {};

  for (const rect of STACK_RECTS) {
    const { x, y } = toWorld(rect);
    const g = new THREE.Group();
    g.position.set(x, y, startsHidden(rect.id) ? HIDDEN_Z : 0);
    baseY[rect.id] = y;

    // Extruded body. Unlit, faded toward the ground colour, so depth is
    // carried by edges and occlusion rather than by a lighting rig.
    const box = new THREE.BoxGeometry(rect.width, rect.height, BOX_DEPTH);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(box),
      new THREE.LineBasicMaterial({
        color: new THREE.Color(palette.muted),
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    );
    g.add(edges);
    disposables.push(edges.geometry, edges.material, box);

    // Solid, ground-coloured body. OPAQUE is the important part, not a
    // style choice: a transparent body writes no useful depth, so every
    // box rendered as a glass cage showing its own far edges through its
    // near face, and the occlusion plane could not hide anything either.
    // Opaque means the front face hides the back faces, the silhouette
    // edges are the only ones that survive — which is what reads as
    // extrusion — and a panel at Z −400 is genuinely behind the occluder
    // rather than merely faint.
    const body = new THREE.Mesh(
      box,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(palette.ground),
        // Push the filled surface a hair back in depth so the edge lines
        // that sit exactly on it win the depth test cleanly instead of
        // z-fighting and stippling as the root rotates.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
    );
    g.add(body);
    disposables.push(body.material);

    // Front face: the texture carries the frame and the type.
    const tex = panelTexture(rect, labels, palette);
    const faceMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    const faceGeo = new THREE.PlaneGeometry(rect.width, rect.height);
    const face = new THREE.Mesh(faceGeo, faceMat);
    // The glyph texture sits a unit above the front face to avoid
    // z-fighting with it.
    face.position.z = FRONT_Z + (rect.kind === "glyph" ? 1 : 0.5);
    g.add(face);
    disposables.push(faceGeo, faceMat, tex);

    groups[rect.id] = g;
    root.add(g);
  }

  const state: StackState = {
    rotationX: 0,
    rotationY: 0,
    productionOffset: PRODUCTION_OFFSET,
    z: Object.fromEntries(STACK_RECTS.map((r) => [r.id, startsHidden(r.id) ? HIDDEN_Z : 0])),
  };

  function apply() {
    root.rotation.x = state.rotationX;
    root.rotation.y = state.rotationY;
    for (const rect of STACK_RECTS) {
      const g = groups[rect.id];
      g.position.z = state.z[rect.id];
      if (rect.id === "production") g.position.y = baseY.production + state.productionOffset;
    }
    // Recentre every frame: without this the diagram appears to sink as
    // production travels down into place and the whole stack grows taller.
    root.position.y = -(baseY.team + (baseY.production + state.productionOffset)) / 2;
    renderer.render(scene, camera);
  }

  function resize(width: number, height: number, dpr: number) {
    if (width <= 0 || height <= 0) return;
    const { halfWidth, halfHeight } = fitFrustum(width / height);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(dpr, 2));
    renderer.setSize(width, height, false);
    apply();
  }

  function dispose() {
    for (const d of disposables) d.dispose();
    renderer.dispose();
  }

  return { state, apply, resize, dispose };
}
