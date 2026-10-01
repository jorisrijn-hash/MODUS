/**
 * MODUS fluid field — raw WebGL2 implementation (Checkpoint 2 spike,
 * Option A). Framework-free on purpose, so its bundle/complexity can be
 * compared honestly against the React Three Fiber version
 * (fluidFieldR3F.tsx) rather than one having React-ecosystem help the
 * other lacks. Pointer-lag/velocity physics live in fluidPhysics.ts,
 * shared with the R3F version — this file owns only the WebGL2
 * program/uniform/lifecycle plumbing.
 *
 * Scope disclosure: this is a smoothed, velocity-reactive glow/trail
 * field (spring-lag physics + a soft radial-falloff shader) — a
 * deliberately lightweight approximation of "fluid feel," not a full
 * incompressible Navier–Stokes simulation (the multi-pass advection/
 * pressure/divergence solve real WebGL fluid-cursor demos use). A true
 * fluid sim is a materially larger, specialized effort; the brief's own
 * repeated caution ("should not be visually extreme... premium, not a
 * gaming website") doesn't call for that fidelity, and
 * MODUS_REDESIGN_PLAN.md already flagged React Bits Pro's actual
 * reference implementation as inaccessible (paid/gated) — this is an
 * original MODUS interpretation of the same *category* of effect, not a
 * port.
 */

import { FluidFieldPhysics, FLUID_FRAGMENT_BODY, type FluidFieldState } from "./fluidPhysics";

export type { FluidFieldState };

const VERTEX_SRC = `#version 300 es
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `#version 300 es
${FLUID_FRAGMENT_BODY}
out vec4 fragColor;
void main() {
  fragColor = fluidField();
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

export class FluidFieldGL {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null;
  private program: WebGLProgram | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private rafId: number | null = null;
  private disposed = false;
  private dpr = 1;
  private lastTime = 0;
  private physics = new FluidFieldPhysics();

  private colorPrimary: readonly [number, number, number] = [0.07, 0.24, 0.18];
  private colorSecondary: readonly [number, number, number] = [0.11, 0.35, 0.26];
  private colorHighlight: readonly [number, number, number] = [0.3, 0.6, 0.48];
  private startTime = performance.now();

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
  };
  private onContextRestored = () => {
    this.setup();
    this.start();
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    if (this.gl) this.setup();
  }

  get supported() {
    return !!this.gl;
  }

  private setup() {
    const gl = this.gl;
    if (!gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.program = program;

    const names = [
      "uResolution",
      "uPointer",
      "uVelocity",
      "uIntensity",
      "uRadiusScale",
      "uTime",
      "uColorPrimary",
      "uColorSecondary",
      "uColorHighlight",
    ];
    for (const name of names) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  /** Adaptive DPR cap — never render at more than 2x, regardless of the
   * device's real pixel ratio, to bound fragment shader cost on high-DPI
   * displays where it buys negligible visible quality for this effect. */
  resize(width: number, height: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setPointer(xNorm: number, yNorm: number) {
    this.physics.setPointer(xNorm, yNorm);
  }

  setState(state: FluidFieldState) {
    this.physics.setState(state);
  }

  setColors(
    primary: readonly [number, number, number],
    secondary: readonly [number, number, number],
    highlight?: readonly [number, number, number]
  ) {
    this.colorPrimary = primary;
    this.colorSecondary = secondary;
    if (highlight) this.colorHighlight = highlight;
  }

  start() {
    if (this.rafId !== null || this.disposed || !this.gl) return;
    this.lastTime = performance.now();
    const loop = (t: number) => {
      this.step(t);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private step(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.physics.step(dt);
    this.render();
  }

  private render() {
    const gl = this.gl;
    if (!gl || !this.program) return;
    const p = this.physics;
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.uPointer, p.smoothed.x, 1 - p.smoothed.y);
    gl.uniform2f(this.uniforms.uVelocity, p.velocity.x, -p.velocity.y);
    gl.uniform1f(this.uniforms.uIntensity, p.intensity);
    gl.uniform1f(this.uniforms.uRadiusScale, p.radiusScale);
    gl.uniform1f(this.uniforms.uTime, (performance.now() - this.startTime) / 1000);
    gl.uniform3f(this.uniforms.uColorPrimary, ...this.colorPrimary);
    gl.uniform3f(this.uniforms.uColorSecondary, ...this.colorSecondary);
    gl.uniform3f(this.uniforms.uColorHighlight, ...this.colorHighlight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Full teardown — GPU resources, RAF loop, context-loss listeners.
   * Safe to call multiple times. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
    const gl = this.gl;
    if (gl && this.program) {
      gl.deleteProgram(this.program);
    }
    this.program = null;
    this.gl = null;
  }
}
