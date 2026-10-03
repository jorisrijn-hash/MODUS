import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Account scoping of the saved Diagnostic reference.
 *
 * The reference holds a capability token for a submitted Diagnostic. It
 * used to be browser-scoped, so signing out or switching accounts left it
 * in place and the next person was shown the previous account's company
 * name and offered their profile. These assert the rules that make that
 * impossible, including the cases that only appear on a shared device.
 */

const store = new Map<string, string>();

const localStorageStub = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

vi.stubGlobal("window", {
  localStorage: localStorageStub,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
  CustomEvent: class {
    constructor(public type: string) {}
  },
});
vi.stubGlobal("CustomEvent", class { constructor(public type: string) {} });

const KEY = "modus:customer-context:v1";

const { getContextReference, saveContextReference, purgeForeignContextReference, clearContextReference } =
  await import("../storage");

beforeEach(() => store.clear());

describe("a saved reference belongs to exactly one identity", () => {
  it("is returned to the identity that saved it", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    expect(getContextReference("user_a")).toMatchObject({ contextToken: "tok_abc", companyName: "Acme BV" });
  });

  it("is NOT returned to a different signed-in account", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    expect(getContextReference("user_b")).toBeNull();
  });

  it("is NOT returned after sign-out", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    // Signing out makes the identity "guest", which is a different
    // identity — not an absence of one.
    expect(getContextReference("guest")).toBeNull();
  });

  it("does not hand a guest submission to an account that signs in later", () => {
    saveContextReference("tok_guest", "Guest Co", "guest");
    expect(getContextReference("user_a")).toBeNull();
    expect(getContextReference("guest")).not.toBeNull();
  });

  it("returns nothing while the identity is still unknown", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    // Clerk still loading. Returning the reference here is what produced a
    // flash of the previous account's data before the account was known.
    expect(getContextReference(null)).toBeNull();
  });

  it("discards a reference written before scoping existed", () => {
    store.set(KEY, JSON.stringify({ contextToken: "tok_old", companyName: "Legacy BV", savedAt: 1 }));
    expect(getContextReference("user_a")).toBeNull();
    expect(getContextReference("guest")).toBeNull();
  });
});

describe("another account's token is removed, not merely hidden", () => {
  it("purges a reference belonging to someone else", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    purgeForeignContextReference("user_b");
    // Not just invisible: gone, so it cannot be read out of storage by
    // anyone with the device.
    expect(store.get(KEY)).toBeUndefined();
  });

  it("purges on sign-out", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    purgeForeignContextReference("guest");
    expect(store.get(KEY)).toBeUndefined();
  });

  it("keeps the current account's own reference", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    purgeForeignContextReference("user_a");
    expect(getContextReference("user_a")).not.toBeNull();
  });

  it("removes an unattributable reference rather than leaving it", () => {
    store.set(KEY, "{not json");
    purgeForeignContextReference("user_a");
    expect(store.get(KEY)).toBeUndefined();
  });

  it("does nothing while the identity is unknown", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    purgeForeignContextReference(null);
    // Must not wipe the signed-in user's own data during the moment
    // before Clerk reports who they are.
    expect(store.get(KEY)).toBeDefined();
  });

  it("clearContextReference removes it outright", () => {
    saveContextReference("tok_abc", "Acme BV", "user_a");
    clearContextReference();
    expect(store.get(KEY)).toBeUndefined();
  });
});
