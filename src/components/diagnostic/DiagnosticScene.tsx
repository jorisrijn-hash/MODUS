"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildDiagnosticCloud,
  emphasisFor,
  stageFor,
  targetsFor,
  type DiagnosticStage,
} from "@/lib/three/diagnosticScene";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useResolvedTheme } from "@/lib/theme/useResolvedTheme";

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aEmphasis;
  varying float vEmphasis;
  void main() {
    vEmphasis = aEmphasis;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  varying float vEmphasis;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = dot(c, c);
    if (d > 0.25) discard;              // circular, not square
    float edge = smoothstep(0.25, 0.17, d);
    // Emphasis drives BOTH colour and opacity: the active topic reads in
    // MODUS green, quieter topics fall back to ink and fade.
    vec3 color = mix(uInk, uAccent, smoothstep(0.6, 1.0, vEmphasis));
    gl_FragColor = vec4(color, edge * mix(0.18, 1.0, vEmphasis));
  }
`;

/**
 * The diagnostic's visual story: an unresolved sphere at entry, topic
 * layers separating as the visitor answers, an ordered stack at review,
 * and — only after the server confirms persistence — a closure that
 * assembles the MODUS mark.
 *
 * One scene, one cloud, persistent point identities. Positions are
 * interpolated toward the current stage's targets every frame, so back
 * navigation, editing and a restored draft all resolve to the correct
 * composition without queued or stale transitions: a new stage simply
 * changes the target and the points continue from wherever they are.
 *
 * It is ILLUSTRATIVE. It never claims anything about the visitor's
 * business, shows no score, and cannot reach the success composition
 * before a real acknowledged submission.
 */
export function DiagnosticScene({
  screen,
  step,
  labels = [],
  className = "",
}: {
  screen: string;
  step: number;
  /** Real diagnostic topic names, one per layer, in step order. */
  labels?: readonly string[];
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const theme = useResolvedTheme();
  // Read inside the frame loop so a stage change never rebuilds the scene
  // or the WebGL context.
  const stageRef = useRef<DiagnosticStage>(stageFor(screen, step));
  const labelLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stageRef.current = stageFor(screen, step);
  }, [screen, step]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const fallback = fallbackRef.current;
    if (!host || !canvas || !fallback) return;

    const showFallback = () => {
      canvas.hidden = true;
      fallback.hidden = false;
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      showFallback();
      return;
    }
    renderer.setClearAlpha(0);

    const cloud = buildDiagnosticCloud();
    const { count } = cloud;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 3.9);

    const positions = new Float32Array(cloud.sphere); // start at entry
    // Larger than the hero cloud: this sits behind a form at lower
    // opacity, and at 0.028 the layers read as dust rather than surfaces.
    const sizes = new Float32Array(count).fill(0.055);
    const emphasis = new Float32Array(count).fill(1);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aEmphasis", new THREE.BufferAttribute(emphasis, 1));

    const dark = theme === "dark";
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uInk: { value: new THREE.Color(dark ? 0xf4f4e7 : 0x1a1614) },
        uAccent: { value: new THREE.Color(dark ? 0x8cafb8 : 0x1e3b2e) },
      },
    });
    // Accent is MODUS green in light; in dark the green is lifted so it
    // stays distinguishable from the cream ink points.
    mat.uniforms.uAccent.value = new THREE.Color(dark ? 0x7aa37f : 0x1e3b2e);

    const points = new THREE.Points(geo, mat);
    const root = new THREE.Group();
    root.add(points);
    scene.add(root);

    function resize() {
      const r = host!.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(r.width, r.height, false);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let raf = 0;
    let last = 0;
    let visible = true;
    let running = false;

    function draw(dt: number) {
      const stage = stageRef.current;
      const target = targetsFor(cloud, stage);
      // Exponential approach: a new stage supersedes the previous one
      // immediately and continues from the CURRENT displayed positions,
      // so rapid back-and-forth never queues or lags.
      const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 3.2);

      for (let i = 0; i < count * 3; i++) {
        positions[i] += (target[i] - positions[i]) * k;
      }
      for (let i = 0; i < count; i++) {
        const want = emphasisFor(cloud, stage, i);
        emphasis[i] += (want - emphasis[i]) * k;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aEmphasis.needsUpdate = true;

      positionLabels(stage);

      // A slow drift only while the information is still unresolved; the
      // composed states are deliberately still.
      if (!reducedMotion) {
        const settle = stage.kind === "sphere" ? 1 : 0.12;
        root.rotation.y += dt * 0.12 * settle;
      }
      renderer.render(scene, camera);
    }

    // --- projected topic labels ------------------------------------------
    // HTML, positioned by projecting each layer's real centroid through the
    // live camera — not texture text, which blurs, and not a fixed offset,
    // which detaches the moment the scene rotates.
    const labelEls = Array.from(
      labelLayerRef.current?.querySelectorAll<HTMLElement>("[data-layer]") ?? []
    );
    const centroid = new THREE.Vector3();

    function positionLabels(stage: DiagnosticStage) {
      if (!labelEls.length) return;
      // Labels belong to the question stages. At entry nothing has been
      // answered, so naming topics there would imply progress that has not
      // happened; the composed states have the form's own headings.
      const show = stage.kind === "layers";
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;

      for (const el of labelEls) {
        const layer = Number(el.dataset.layer);
        if (!show) {
          el.style.opacity = "0";
          continue;
        }
        centroid.set(0, 0, 0);
        let n = 0;
        for (let i = 0; i < count; i++) {
          if (cloud.layerOf[i] !== layer) continue;
          centroid.x += positions[i * 3];
          centroid.y += positions[i * 3 + 1];
          centroid.z += positions[i * 3 + 2];
          n++;
        }
        if (!n) continue;
        centroid.divideScalar(n);
        root.localToWorld(centroid);
        centroid.project(camera);

        // Behind the camera or outside the frame: suppress rather than
        // pin a label to a point that is not really there.
        if (centroid.z > 1 || Math.abs(centroid.x) > 1 || Math.abs(centroid.y) > 1) {
          el.style.opacity = "0";
          continue;
        }
        const x = (centroid.x * 0.5 + 0.5) * w;
        const y = (-centroid.y * 0.5 + 0.5) * h;
        el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%)`;
        // The active topic is legible; the rest are present but quiet, so
        // the reader is never asked to parse six labels at once.
        const active = stage.kind === "layers" && layer === stage.activeLayer;
        el.style.opacity = active ? "1" : "0.28";
        el.style.fontWeight = active ? "500" : "400";
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      draw(dt);
    }

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (visible && !document.hidden ? start() : stop());

    if (reducedMotion) {
      // Static composition for the current stage: no morph, no drift.
      positions.set(targetsFor(cloud, stageRef.current));
      for (let i = 0; i < count; i++) emphasis[i] = emphasisFor(cloud, stageRef.current, i);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aEmphasis.needsUpdate = true;
      positionLabels(stageRef.current);
      renderer.render(scene, camera);
    } else {
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        sync();
      });
      io.observe(host);
      document.addEventListener("visibilitychange", sync);
      return () => {
        stop();
        io.disconnect();
        document.removeEventListener("visibilitychange", sync);
        ro.disconnect();
        geo.dispose();
        mat.dispose();
        renderer.dispose();
      };
    }

    return () => {
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [reducedMotion, theme, labels]);

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/*
       * Decorative duplicates of the form's own headings, so they are
       * hidden from assistive technology — the question heading and the
       * progress indicator are the accessible representation.
       */}
      <div ref={labelLayerRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
        {labels.map((label, i) => (
          <span
            key={label}
            data-layer={i}
            className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-line/60 bg-surface/85 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink opacity-0 backdrop-blur-[2px] transition-opacity duration-300"
          >
            {label}
          </span>
        ))}
      </div>
      {/* Non-WebGL fallback: a static layered mark, so the stage is still
          communicated and the diagnostic stays completely usable. */}
      <div
        ref={fallbackRef}
        hidden
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center [&[hidden]]:hidden"
      >
        <span className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.5 w-16 rounded-full bg-line-strong/40"
              style={{ opacity: 1 - i * 0.25 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
