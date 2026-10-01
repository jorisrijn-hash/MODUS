/**
 * Framework-agnostic pointer-lag/velocity/settling physics, shared by both
 * Checkpoint 2 WebGL spikes (raw WebGL2 and React Three Fiber) so the
 * comparison between them is about rendering infrastructure and lifecycle,
 * not two different-feeling implementations of "fluid feel."
 */

export type FluidFieldState = "idle" | "hover-cta" | "hover-text" | "hover-media";

const STATE_RADIUS: Record<FluidFieldState, number> = {
  idle: 1,
  "hover-cta": 1.6,
  "hover-text": 0.7,
  "hover-media": 1.3,
};

export class FluidFieldPhysics {
  target = { x: 0.5, y: 0.5 };
  smoothed = { x: 0.5, y: 0.5 };
  velocity = { x: 0, y: 0 };
  intensity = 0;
  targetRadiusScale = 1;
  radiusScale = 1;

  setPointer(xNorm: number, yNorm: number) {
    this.target.x = xNorm;
    this.target.y = yNorm;
  }

  setState(state: FluidFieldState) {
    this.targetRadiusScale = STATE_RADIUS[state];
  }

  /** Advance the simulation by `dt` seconds. Call once per rendered frame. */
  step(dt: number) {
    const prevX = this.smoothed.x;
    const prevY = this.smoothed.y;

    const lerpFactor = 1 - Math.pow(0.001, dt);
    this.smoothed.x += (this.target.x - this.smoothed.x) * lerpFactor;
    this.smoothed.y += (this.target.y - this.smoothed.y) * lerpFactor;
    this.radiusScale += (this.targetRadiusScale - this.radiusScale) * lerpFactor;

    const instVelX = dt > 0 ? (this.smoothed.x - prevX) / dt : 0;
    const instVelY = dt > 0 ? (this.smoothed.y - prevY) / dt : 0;
    this.velocity.x += (instVelX - this.velocity.x) * 0.15;
    this.velocity.y += (instVelY - this.velocity.y) * 0.15;

    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    const targetIntensity = Math.min(speed * 0.6, 1);
    this.intensity += (targetIntensity - this.intensity) * (targetIntensity > this.intensity ? 0.3 : 0.05);
  }
}

/**
 * Checkpoint 5.5, second pass — the single-blob version above (kept in
 * git-less history only via this comment, not a second file) still read
 * as "a glow behind text," not an environmental mass with a visible
 * silhouette. A true incompressible-fluid solve (advection/pressure/
 * divergence across multiple render-to-texture passes — what React
 * Bits' "Splash Cursor" actually runs) is a materially larger,
 * specialized effort, consistent with this file's own prior documented
 * scope decision above; not attempted here. What *is* implemented: a
 * richer procedural approximation aimed at the same qualitative targets
 * — organic (non-circular) silhouettes, multiple independently-drifting
 * masses so the field has real presence before any pointer movement,
 * and a broad pointer-reactive disturbance layered on top rather than a
 * thin cursor trail. Explicitly an approximation, not a port — see
 * MODUS_REDESIGN_REPORT.md's Checkpoint 5.5 (second pass) entry for the
 * honest comparison against the real thing and what a future true-fluid
 * pass would involve.
 */
export const FLUID_FRAGMENT_BODY = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uIntensity;
uniform float uRadiusScale;
uniform float uTime;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform vec3 uColorHighlight;

float blob(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  // A tighter falloff band (0.55*radius -> radius, instead of the full
  // 0 -> radius) keeps the core solid and gives the mass a real edge to
  // read as a silhouette against, rather than smoothly fading the whole
  // way from center to transparent.
  return smoothstep(radius, radius * 0.55, d);
}

// An "organic" mass: three overlapping soft circles, each drifting on its
// own slow sine/cosine path, summed together. Breaks up what would
// otherwise be a flat, perfectly circular disc into something closer to
// a cloud/liquid silhouette — still cheap (no textures, no iteration),
// just more terms than a single blob() call.
float organicMass(vec2 uv, vec2 center, float radius, float phase) {
  float m = 0.0;
  m += blob(uv, center + vec2(sin(phase * 0.6) * radius * 0.35, cos(phase * 0.5) * radius * 0.3), radius);
  m += blob(uv, center + vec2(cos(phase * 0.8 + 2.0) * radius * 0.4, sin(phase * 0.4 + 1.0) * radius * 0.35), radius * 0.75) * 0.8;
  m += blob(uv, center + vec2(sin(phase * 0.3 + 4.0) * radius * 0.5, cos(phase * 0.7 + 3.0) * radius * 0.4), radius * 0.55) * 0.6;
  return clamp(m, 0.0, 1.0);
}

vec4 fluidField() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 uvA = uv; uvA.x *= aspect;
  vec2 pA = uPointer; pA.x *= aspect;
  vec2 unit = vec2(aspect, 1.0);

  // Environmental mass — present at rest, independent of the pointer.
  // Three masses: a large dominant form anchored toward the upper-right
  // (bleeding toward that corner), a wider body stretching through the
  // middle, and a smaller one fading toward the bottom — deliberately
  // asymmetric, not centered.
  float massA = organicMass(uvA, vec2(0.86, 0.82) * unit, 0.46 * uRadiusScale, uTime * 0.07);
  float massB = organicMass(uvA, vec2(0.62, 0.42) * unit, 0.40 * uRadiusScale, uTime * 0.05 + 10.0) * 0.85;
  float massC = organicMass(uvA, vec2(0.74, 0.14) * unit, 0.30 * uRadiusScale, uTime * 0.09 + 20.0) * 0.6;
  float environmental = clamp(massA + massB + massC, 0.0, 1.0);

  // Pointer-reactive layer: a broad disturbance, not a thin streak —
  // radius raised well past the single-blob version's, so a moving
  // pointer visibly pushes a wide area rather than drawing a narrow line.
  float baseRadius = (0.32 + uIntensity * 0.1) * uRadiusScale;
  float core = blob(uvA, pA, baseRadius);
  vec2 trailOffset = -uVelocity * 0.06;
  float trail = blob(uvA, pA + trailOffset, baseRadius * 0.68) * 0.4;
  float pointerField = clamp(core + trail, 0.0, 1.0);

  // The pointer brightens/pushes the existing environmental mass rather
  // than drawing an unrelated second shape over it — "disturbing
  // existing material," not "drawing on an empty canvas."
  float field = clamp(environmental + pointerField * 0.75, 0.0, 1.0);
  // A visible silhouette, not a hazy glow: punch the falloff so the mass
  // has a defined edge rather than a long, soft gradient fading evenly
  // from center to transparent.
  field = pow(field, 0.55);

  vec3 color = mix(uColorSecondary, uColorPrimary, environmental);
  color = mix(color, uColorHighlight, pointerField * 0.5 + massA * 0.14);

  float alpha = field * (0.62 + uIntensity * 0.22);
  return vec4(color * alpha, alpha);
}
`;
