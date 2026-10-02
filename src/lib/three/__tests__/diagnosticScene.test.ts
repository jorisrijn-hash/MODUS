import { describe, expect, it } from "vitest";
import {
  buildDiagnosticCloud,
  emphasisFor,
  stageFor,
  targetsFor,
} from "../diagnosticScene";

describe("stage mapping", () => {
  it("opens on the unresolved sphere", () => {
    expect(stageFor("intro", 0)).toEqual({ kind: "sphere" });
  });

  it("exposes the layer matching the current step", () => {
    expect(stageFor("form", 0)).toEqual({ kind: "layers", activeLayer: 0 });
    expect(stageFor("form", 3)).toEqual({ kind: "layers", activeLayer: 3 });
  });

  it("clamps an out-of-range step instead of producing a missing layer", () => {
    expect(stageFor("form", 99)).toEqual({ kind: "layers", activeLayer: 5 });
    expect(stageFor("form", -4)).toEqual({ kind: "layers", activeLayer: 0 });
  });

  it("HOLDS the review structure while submitting and on failure", () => {
    // Nothing may anticipate success: a pending or failed submission must
    // look identical to review, never like the closing composition.
    expect(stageFor("review", 5)).toEqual({ kind: "stack" });
    expect(stageFor("submitting", 5)).toEqual({ kind: "stack" });
    expect(stageFor("submit_error", 5)).toEqual({ kind: "stack" });
  });

  it("reaches the closing composition ONLY after acknowledged persistence", () => {
    expect(stageFor("result", 5)).toEqual({ kind: "settled" });
    // A returning visitor with an already-submitted record renders the
    // settled state directly, without replaying the first-submission motion.
    expect(stageFor("profile", 0)).toEqual({ kind: "settled" });

    for (const screen of ["intro", "form", "review", "submitting", "submit_error"]) {
      expect(stageFor(screen, 2).kind).not.toBe("settled");
    }
  });
});

describe("cloud geometry", () => {
  const cloud = buildDiagnosticCloud();

  it("is deterministic for a given seed", () => {
    const again = buildDiagnosticCloud();
    expect(Array.from(again.sphere.slice(0, 30))).toEqual(Array.from(cloud.sphere.slice(0, 30)));
  });

  it("keeps point identities across every stage", () => {
    for (const stage of [
      { kind: "sphere" } as const,
      { kind: "layers", activeLayer: 1 } as const,
      { kind: "stack" } as const,
      { kind: "settled" } as const,
    ]) {
      expect(targetsFor(cloud, stage).length).toBe(cloud.count * 3);
    }
  });

  it("separates layers further when exploded than when stacked", () => {
    const yOf = (buf: Float32Array, i: number) => buf[i * 3 + 1];
    const first = 0;
    const last = cloud.count - 1;
    const explodedGap = Math.abs(yOf(cloud.exploded, first) - yOf(cloud.exploded, last));
    const stackGap = Math.abs(yOf(cloud.stack, first) - yOf(cloud.stack, last));
    expect(explodedGap).toBeGreaterThan(stackGap);
  });

  it("emphasises the active topic, keeps completed ones visible, subdues later ones", () => {
    const stage = { kind: "layers", activeLayer: 3 } as const;
    const byLayer = (layer: number) => {
      const i = cloud.layerOf.indexOf(layer);
      return emphasisFor(cloud, stage, i);
    };
    expect(byLayer(3)).toBe(1);
    expect(byLayer(1)).toBeGreaterThan(0);
    expect(byLayer(1)).toBeLessThan(1);
    expect(byLayer(5)).toBeLessThan(byLayer(1));
  });

  it("applies no emphasis gradient outside the question stages", () => {
    expect(emphasisFor(cloud, { kind: "stack" }, 0)).toBe(1);
    expect(emphasisFor(cloud, { kind: "settled" }, 0)).toBe(1);
  });
});
