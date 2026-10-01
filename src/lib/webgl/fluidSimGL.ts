/**
 * MODUS fluid field — a real incompressible-fluid simulation, raw WebGL2.
 *
 * Replaces the earlier procedural multi-blob approximation
 * (`fluidPhysics.ts`'s `FLUID_FRAGMENT_BODY`, now unused by production)
 * after the Checkpoint 5.5 review explicitly approved the engineering
 * effort: the approximation read as "large gradients / drifting masses,"
 * not "material / liquid / displaced pigment," and the field is now a
 * signature part of the MODUS hero rather than a decorative cursor
 * effect.
 *
 * Algorithm: Jos Stam's "Stable Fluids" semi-Lagrangian method — the
 * standard GPU formulation used by essentially every WebGL fluid demo
 * (including the one React Bits' "Splash Cursor" wraps). Per frame:
 *
 *   curl → vorticity confinement → divergence → pressure (Jacobi
 *   iterations) → gradient subtraction → advect velocity → advect dye
 *   → splats → display
 *
 * Implemented from the published algorithm into this project's existing
 * raw-WebGL2 infrastructure, not ported from another codebase, and
 * deliberately NOT tuned to the stock "colorful cursor trail" look —
 * see the TUNING constants below for the MODUS-specific direction
 * (broader splats, weaker force, long dye persistence, slow velocity
 * dissipation, moderate curl, no hue cycling, seeded mass at rest).
 */

export type FluidTuning = {
  /** Velocity-field grid resolution (longer axis). Lower = cheaper. */
  simResolution: number;
  /** Dye/pigment grid resolution (longer axis). Usually > sim. */
  dyeResolution: number;
  /** Per-second multiplier on dye; lower = pigment lingers longer. */
  densityDissipation: number;
  /** Per-second multiplier on velocity; lower = momentum carries. */
  velocityDissipation: number;
  /** Per-frame pressure decay before the Jacobi solve. */
  pressure: number;
  /** Jacobi iterations for the pressure Poisson solve. */
  pressureIterations: number;
  /** Vorticity-confinement strength — organic rolling/folding. */
  curl: number;
  /** Splat size, as a fraction of the viewport. */
  splatRadius: number;
  /** Velocity injected per splat. */
  splatForce: number;
};

export const MODUS_FLUID_TUNING: FluidTuning = {
  simResolution: 128,
  dyeResolution: 512,
  // Tuning history, because the two failure modes pull in opposite
  // directions: 0.4 let the seeded mass fade to a wispy ~30% within 3s
  // (no mass at rest); 0.12 held the mass but never cleared, so sustained
  // pointer movement accumulated dye until it flooded the viewport and
  // did not settle. 0.34 clears transient pointer pigment over a few
  // seconds while `replenishRestingMass()` below keeps the composed
  // resting form topped up — mass at rest *and* a field that settles.
  densityDissipation: 0.34,
  velocityDissipation: 0.7,
  pressure: 0.8,
  pressureIterations: 20,
  // Moderate: enough folding to read as liquid, not enough to look
  // turbulent. First capture at 22 produced quite sooty, fractal edges;
  // pulled back so the mass holds a rounder, calmer silhouette closer to
  // the reference's soft organic form.
  curl: 14,
  // Much larger + much weaker than stock: broad displacement of existing
  // material rather than fast narrow jets.
  splatRadius: 0.42,
  splatForce: 2200,
};

const VERT_SRC = `#version 300 es
precision highp float;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = pos;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG_HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
`;

const SPLAT_FRAG = `${FRAG_HEAD}
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

const ADVECTION_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = texture(uSource, coord);
  float decay = 1.0 + dissipation * dt;
  fragColor = result / decay;
}`;

const DIVERGENCE_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_FRAG = `${FRAG_HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy;
  vel += force * dt;
  vel = min(max(vel, -1000.0), 1000.0);
  fragColor = vec4(vel, 0.0, 1.0);
}`;

const PRESSURE_FRAG = `${FRAG_HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_FRAG = `${FRAG_HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const CLEAR_FRAG = `${FRAG_HEAD}
uniform sampler2D uTexture;
uniform float value;
void main() {
  fragColor = value * texture(uTexture, vUv);
}`;

/**
 * Display pass. Maps the raw dye field onto MODUS's palette rather than
 * showing dye RGB directly — this is where the "reference contrast
 * system, green instead of blue" translation happens: the dye's
 * *density* drives a ramp from the page's own background, through a
 * deep near-black-green core, out to a restrained green glow, with a
 * pale highlight only at the very densest points.
 */
const DISPLAY_FRAG = `${FRAG_HEAD}
uniform sampler2D uTexture;
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uGlow;
uniform float uIntensity;
void main() {
  vec3 dye = texture(uTexture, vUv).rgb;
  float density = clamp(length(dye), 0.0, 1.0);
  float d = pow(density, 0.75);
  vec3 color = mix(uGlow, uMid, smoothstep(0.0, 0.55, d));
  // Core held to the very densest material only — at a lower threshold
  // the (pale, in dark mode) core tone spread across too much of the
  // mass and read as minty-white rather than as a highlight.
  color = mix(color, uCore, smoothstep(0.72, 1.0, d));
  float alpha = clamp(d * uIntensity, 0.0, 1.0);
  fragColor = vec4(color * alpha, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Fluid shader compile error: ${log}`);
  }
  return shader;
}

class Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null> = {};

  constructor(
    private gl: WebGL2RenderingContext,
    vertSrc: string,
    fragSrc: string
  ) {
    const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Fluid program link error: ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.program = program;
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i)!.name;
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
  }

  use() {
    this.gl.useProgram(this.program);
  }

  dispose() {
    this.gl.deleteProgram(this.program);
  }
}

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach(id: number): number;
};

type DoubleFBO = {
  read: FBO;
  write: FBO;
  swap(): void;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

export type FluidPalette = {
  /** Densest core of the mass — the near-black form in both themes. */
  core: readonly [number, number, number];
  /** Mid-density body — where the MODUS green actually lives. */
  mid: readonly [number, number, number];
  /** Outer glow/atmosphere, closest to the page background. */
  glow: readonly [number, number, number];
  /** Overall opacity ceiling for the composited field. */
  intensity: number;
  /** Dye injected per splat (drives density, not final color). */
  dye: readonly [number, number, number];
};

export class FluidSimGL {
  private gl: WebGL2RenderingContext | null;
  private programs: Record<string, Program> = {};
  private velocity!: DoubleFBO;
  private dye!: DoubleFBO;
  private pressure!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private rafId: number | null = null;
  private disposed = false;
  private lastTime = 0;
  private seeded = false;
  private ambientClock = 0;
  private pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false };
  private tuning: FluidTuning;
  private palette: FluidPalette;
  private supportedFlag = false;

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
  };

  constructor(
    private canvas: HTMLCanvasElement,
    tuning: FluidTuning = MODUS_FLUID_TUNING,
    palette: FluidPalette
  ) {
    this.tuning = tuning;
    this.palette = palette;
    this.gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    if (this.gl) {
      // Rendering to float/half-float targets is what makes a stable
      // fluid solve possible at all — without it we bail rather than
      // render something subtly wrong.
      const ext = this.gl.getExtension("EXT_color_buffer_float");
      if (ext) {
        try {
          this.init();
          this.supportedFlag = true;
        } catch {
          this.supportedFlag = false;
        }
      }
    }
  }

  get supported() {
    return this.supportedFlag;
  }

  private createFBO(w: number, h: number, internalFormat: number, format: number, type: number): FBO {
    const gl = this.gl!;
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("Fluid FBO incomplete");
    }
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  private createDoubleFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number
  ): DoubleFBO {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type);
    return {
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      get read() {
        return fbo1;
      },
      set read(v: FBO) {
        fbo1 = v;
      },
      get write() {
        return fbo2;
      },
      set write(v: FBO) {
        fbo2 = v;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  private init() {
    const gl = this.gl!;
    this.programs = {
      splat: new Program(gl, VERT_SRC, SPLAT_FRAG),
      advection: new Program(gl, VERT_SRC, ADVECTION_FRAG),
      divergence: new Program(gl, VERT_SRC, DIVERGENCE_FRAG),
      curl: new Program(gl, VERT_SRC, CURL_FRAG),
      vorticity: new Program(gl, VERT_SRC, VORTICITY_FRAG),
      pressure: new Program(gl, VERT_SRC, PRESSURE_FRAG),
      gradientSubtract: new Program(gl, VERT_SRC, GRADIENT_SUBTRACT_FRAG),
      clear: new Program(gl, VERT_SRC, CLEAR_FRAG),
      display: new Program(gl, VERT_SRC, DISPLAY_FRAG),
    };
    this.initFramebuffers();
  }

  private initFramebuffers() {
    const gl = this.gl!;
    const aspect = this.canvas.width / Math.max(this.canvas.height, 1) || 1;
    const simRes = this.resolutionFor(this.tuning.simResolution, aspect);
    const dyeRes = this.resolutionFor(this.tuning.dyeResolution, aspect);

    this.velocity = this.createDoubleFBO(simRes.w, simRes.h, gl.RG16F, gl.RG, gl.HALF_FLOAT);
    this.dye = this.createDoubleFBO(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    this.pressure = this.createDoubleFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT);
    this.divergence = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT);
    this.curl = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT);
    this.seeded = false;
  }

  private resolutionFor(resolution: number, aspect: number) {
    const min = Math.round(resolution);
    const max = Math.round(resolution * (aspect > 1 ? aspect : 1 / aspect));
    return aspect > 1 ? { w: max, h: min } : { w: min, h: max };
  }

  private blit(target: FBO | null) {
    const gl = this.gl!;
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  resize(width: number, height: number, dpr: number) {
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.supportedFlag) this.initFramebuffers();
  }

  setPalette(palette: FluidPalette) {
    this.palette = palette;
  }

  /** Pointer position in normalized 0..1 canvas space (y down). */
  setPointer(x: number, y: number) {
    const prevX = this.pointer.x;
    const prevY = this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = 1 - y;
    this.pointer.dx = (this.pointer.x - prevX) * this.tuning.splatForce;
    this.pointer.dy = (this.pointer.y - prevY) * this.tuning.splatForce;
    this.pointer.moved = true;
  }

  private splat(x: number, y: number, dx: number, dy: number, dye: readonly [number, number, number], radiusScale = 1) {
    const gl = this.gl!;
    const p = this.programs.splat;
    p.use();
    gl.uniform1i(p.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(p.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(p.uniforms.point, x, y);
    gl.uniform3f(p.uniforms.color, dx, dy, 0);
    gl.uniform1f(p.uniforms.radius, this.splatRadiusValue(radiusScale));
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(p.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(p.uniforms.color, dye[0], dye[1], dye[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private splatRadiusValue(scale: number) {
    const r = (this.tuning.splatRadius / 100) * scale;
    const aspect = this.canvas.width / this.canvas.height;
    return aspect > 1 ? r * aspect : r;
  }

  /**
   * Mass at rest. The hero must already contain a composed field before
   * any pointer movement — several large, low-velocity dye splats
   * weighted toward the upper-right, with a softer body through the
   * centre-right and material trailing toward the lower-centre.
   */
  /**
   * The resting composition: a dominant form hard right (bleeding
   * off-canvas), a softer body trailing down the right edge. Weighted
   * outward deliberately — the headline is centred, and an earlier
   * tuning pass seeded too far inboard (x≈0.58–0.82), which swallowed
   * the end of the first headline line.
   */
  private static readonly SEEDS: ReadonlyArray<readonly [number, number, number, number, number]> = [
    // x, y (0..1, y up), dx, dy, radiusScale
    // Dominant form, hard right, bleeding off-canvas.
    [0.95, 0.8, -40, -30, 2.6],
    [0.88, 0.6, 30, -50, 2.2],
    [1.02, 0.46, -60, 20, 1.9],
    [0.84, 0.26, 20, 40, 2.0],
    // Low atmospheric band. Added after the blur/silhouette comparison
    // against the reference showed MODUS's green confined to the right
    // edge while the reference carries a broad green spread across the
    // whole lower half of the viewport — the single clearest structural
    // difference in that test. Wide, low-velocity, low in the frame, so
    // it reads as atmosphere under the composition rather than as more
    // discrete masses.
    [0.2, 0.06, 20, 25, 3.2],
    [0.5, 0.02, 0, 30, 3.4],
    [0.78, 0.08, -20, 25, 3.0],
  ];

  private seedInitialState() {
    for (const [x, y, dx, dy, r] of FluidSimGL.SEEDS) {
      this.splat(x, y, dx, dy, this.palette.dye, r);
    }
    this.seeded = true;
  }

  /**
   * Keeps the resting form alive against dissipation. Without this, a
   * dissipation rate high enough to clear transient pointer pigment also
   * erases the composed mass the hero needs before any interaction. Dye
   * is injected at a fraction of the seed strength and with no velocity,
   * so it tops the form up rather than visibly pulsing.
   */
  private replenishRestingMass() {
    const dye = this.palette.dye;
    const weak: [number, number, number] = [dye[0] * 0.3, dye[1] * 0.3, dye[2] * 0.3];
    for (const [x, y, , , r] of FluidSimGL.SEEDS) {
      this.splat(x, y, 0, 0, weak, r);
    }
  }

  /**
   * Idle evolution — the field should never be completely frozen, but
   * must stay subtle enough that a still screenshot reads as composed
   * rather than mid-animation. One very weak, slowly-wandering splat
   * every couple of seconds.
   */
  private ambientDisturbance(dt: number) {
    this.ambientClock += dt;
    if (this.ambientClock < 1.6) return;
    this.ambientClock = 0;
    this.replenishRestingMass();
    const t = performance.now() / 1000;
    const x = 0.92 + Math.sin(t * 0.21) * 0.1;
    const y = 0.5 + Math.cos(t * 0.17) * 0.26;
    const dx = Math.cos(t * 0.3) * 40;
    const dy = Math.sin(t * 0.27) * 40;
    this.splat(x, y, dx, dy, this.palette.dye, 1.9);
  }

  private step(dt: number) {
    const gl = this.gl!;
    const t = this.tuning;
    gl.disable(gl.BLEND);

    // curl
    let p = this.programs.curl;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    // vorticity confinement
    p = this.programs.vorticity;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(p.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(p.uniforms.curl, t.curl);
    gl.uniform1f(p.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // divergence
    p = this.programs.divergence;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    // decay previous pressure (cheaper and more stable than clearing)
    p = this.programs.clear;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.pressure.texelSizeX, this.pressure.texelSizeY);
    gl.uniform1i(p.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(p.uniforms.value, t.pressure);
    this.blit(this.pressure.write);
    this.pressure.swap();

    // pressure solve (Jacobi)
    p = this.programs.pressure;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.pressure.texelSizeX, this.pressure.texelSizeY);
    gl.uniform1i(p.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < t.pressureIterations; i++) {
      gl.uniform1i(p.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    // make velocity divergence-free
    p = this.programs.gradientSubtract;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    // advect velocity by itself
    p = this.programs.advection;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(p.uniforms.uSource, this.velocity.read.attach(0));
    gl.uniform1f(p.uniforms.dt, dt);
    gl.uniform1f(p.uniforms.dissipation, t.velocityDissipation);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // advect dye by velocity
    gl.uniform2f(p.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(p.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(p.uniforms.dissipation, t.densityDissipation);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private render() {
    const gl = this.gl!;
    const p = this.programs.display;
    p.use();
    gl.uniform2f(p.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(p.uniforms.uTexture, this.dye.read.attach(0));
    gl.uniform3f(p.uniforms.uCore, ...(this.palette.core as [number, number, number]));
    gl.uniform3f(p.uniforms.uMid, ...(this.palette.mid as [number, number, number]));
    gl.uniform3f(p.uniforms.uGlow, ...(this.palette.glow as [number, number, number]));
    gl.uniform1f(p.uniforms.uIntensity, this.palette.intensity);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.blit(null);
  }

  start() {
    if (this.rafId !== null || this.disposed || !this.supportedFlag) return;
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 1 / 30);
      this.lastTime = time;
      if (!this.seeded) this.seedInitialState();
      if (this.pointer.moved) {
        this.pointer.moved = false;
        this.splat(this.pointer.x, this.pointer.y, this.pointer.dx, this.pointer.dy, this.palette.dye);
        this.pointer.dx = 0;
        this.pointer.dy = 0;
      }
      this.ambientDisturbance(dt);
      this.step(dt);
      this.render();
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

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    const gl = this.gl;
    if (gl) {
      for (const program of Object.values(this.programs)) program.dispose();
      for (const fbo of [this.divergence, this.curl]) {
        if (fbo) {
          gl.deleteTexture(fbo.texture);
          gl.deleteFramebuffer(fbo.fbo);
        }
      }
      for (const dbl of [this.velocity, this.dye, this.pressure]) {
        if (dbl) {
          for (const fbo of [dbl.read, dbl.write]) {
            gl.deleteTexture(fbo.texture);
            gl.deleteFramebuffer(fbo.fbo);
          }
        }
      }
    }
    this.programs = {};
    this.gl = null;
  }
}
