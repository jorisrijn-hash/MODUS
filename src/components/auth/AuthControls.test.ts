import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";

const state = vi.hoisted(() => ({ configured: true, signedIn: false }));
vi.mock("@/lib/auth/clerkConfig", () => ({
  isClerkPubliclyConfigured: () => state.configured,
}));
vi.mock("@clerk/nextjs", () => ({
  Show: ({ when, children }: { when: string; children: ReactNode }) =>
    state.signedIn === (when === "signed-in") ? children : null,
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUpButton: ({ children }: { children: ReactNode }) => children,
  UserButton: () => createElement("button", { "aria-label": "Clerk account" }),
}));
import { AuthControls } from "./AuthControls";

beforeEach(() => {
  state.configured = true;
  state.signedIn = false;
});
describe("mobile account entry", () => {
  it("routes sign-in and sign-up to the canonical Clerk pages", () => {
    const html = renderToStaticMarkup(
      createElement(AuthControls, { variant: "mobile" }),
    );
    expect(html).toContain('href="/sign-in"');
    expect(html).toContain('href="/sign-up"');
    expect(html).not.toContain("password");
  });
  it("shows Clerk's account control only after sign-in", () => {
    state.signedIn = true;
    const html = renderToStaticMarkup(
      createElement(AuthControls, { variant: "mobile" }),
    );
    expect(html).toContain("Clerk account");
    expect(html).not.toContain('href="/sign-in"');
  });
  it("offers no account controls when Clerk is unconfigured", () => {
    state.configured = false;
    expect(
      renderToStaticMarkup(createElement(AuthControls, { variant: "mobile" })),
    ).toBe("");
  });
});
