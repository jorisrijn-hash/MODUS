/**
 * MODUS image bulge/distortion — Checkpoint 2 spike (Section 11).
 * Deliberately built on the exact same raw-WebGL2 primitives as the fluid
 * field (full-screen-triangle vertex trick, same class shape, same
 * pointer-lag physics from fluidPhysics.ts) rather than a separate
 * infrastructure — this file *is* the answer to "should this share the
 * fluid field's WebGL infrastructure": yes, and this is the proof, not
 * just an assertion. The two differ only in their fragment shader (a
 * textured, cover-fit UV lens/bulge sample here vs. a radial glow there)
 * and in needing a texture upload step this effect requires and the
 * fluid field doesn't.
 */

import { FluidFieldPhysics } from "./fluidPhysics";

const VERTEX_SRC = `#version 300 es
out vec2 vUv;
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uCoverScale; // cover-fit UV scale so the image never stretches
uniform vec2 uCoverOffset;
uniform vec2 uPointer;
uniform float uIntensity; // 0..1, eases in/out on pointer enter/leave
uniform float uAspect; // canvas width / height, for a circular (not elliptical) lens radius
out vec4 fragColor;

void main() {
  vec2 uv = vUv * uCoverScale + uCoverOffset;

  vec2 d = vUv - uPointer;
  d.x *= uAspect;
  float dist = length(d);
  float radius = 0.22;
  float falloff = smoothstep(radius, 0.0, dist) * uIntensity;

  // Lens/bulge: pull sampled UV toward the pointer, stronger near the
  // center of the radius, easing to zero at its edge and beyond — this
  // reads as local magnification, not a warp/pinch.
  vec2 dirUv = vUv - uPointer;
  vec2 bulgeOffset = dirUv * falloff * 0.35;
  vec2 distortedUv = vUv - bulgeOffset;

  vec2 sampleUv = distortedUv * uCoverScale + uCoverOffset;
  fragColor = texture(uImage, sampleUv);
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

export class ImageBulgeGL {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private rafId: number | null = null;
  private disposed = false;
  private physics = new FluidFieldPhysics();
  private targetIntensity = 0;
  private currentIntensity = 0;
  private lastTime = 0;
  private coverScale: [number, number] = [1, 1];
  private coverOffset: [number, number] = [0, 0];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false });
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

    for (const name of ["uImage", "uCoverScale", "uCoverOffset", "uPointer", "uIntensity", "uAspect"]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  async loadImage(src: string) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
    const gl = this.gl;
    if (!gl || !this.texture) return;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    this.updateCoverFit(img.naturalWidth, img.naturalHeight);
  }

  private updateCoverFit(imgW: number, imgH: number) {
    const canvasAspect = this.canvas.width / this.canvas.height;
    const imgAspect = imgW / imgH;
    // object-fit: cover — preserves the image's own crop rather than
    // stretching it to the canvas's aspect ratio.
    if (canvasAspect > imgAspect) {
      this.coverScale = [1, imgAspect / canvasAspect];
    } else {
      this.coverScale = [canvasAspect / imgAspect, 1];
    }
    this.coverOffset = [(1 - this.coverScale[0]) / 2, (1 - this.coverScale[1]) / 2];
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setPointer(xNorm: number, yNorm: number) {
    this.physics.setPointer(xNorm, yNorm);
  }

  setActive(active: boolean) {
    this.targetIntensity = active ? 1 : 0;
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
    this.currentIntensity += (this.targetIntensity - this.currentIntensity) * (1 - Math.pow(0.001, dt));
    this.render();
  }

  private render() {
    const gl = this.gl;
    if (!gl || !this.program) return;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniforms.uImage, 0);
    gl.uniform2f(this.uniforms.uCoverScale, ...this.coverScale);
    gl.uniform2f(this.uniforms.uCoverOffset, ...this.coverOffset);
    gl.uniform2f(this.uniforms.uPointer, this.physics.smoothed.x, 1 - this.physics.smoothed.y);
    gl.uniform1f(this.uniforms.uIntensity, this.currentIntensity);
    gl.uniform1f(this.uniforms.uAspect, this.canvas.width / this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    const gl = this.gl;
    if (gl) {
      if (this.program) gl.deleteProgram(this.program);
      if (this.texture) gl.deleteTexture(this.texture);
    }
    this.program = null;
    this.texture = null;
    this.gl = null;
  }
}
