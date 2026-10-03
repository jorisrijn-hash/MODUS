import { test, expect } from "@playwright/test";

test("OS demo teaches evidence, moves a sample card and resets without backend writes", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" &&
      /\/api\/(private|diagnostic|cron)/.test(request.url())
    )
      writes.push(request.url());
  });
  await page.goto("/platform");
  const demo = page.getByTestId("platform-demo");
  await demo.scrollIntoViewIfNeeded();
  await demo.getByRole("button", { name: "Inspect the signal" }).click();
  await demo.getByRole("button", { name: "Why is this showing?" }).click();
  await expect(demo.getByText("Reported answers:")).toBeVisible();
  await demo.getByRole("button", { name: "Start sample review" }).click();
  await expect(demo.getByLabel("Sample card stage")).toHaveValue("review");
  await demo.getByLabel("Sample card stage").selectOption("contacted");
  await demo
    .getByLabel("What would you validate first?")
    .fill("Who owns follow-up?");
  await demo.getByRole("button", { name: "Save in demo" }).click();
  await expect(demo.getByRole("status")).toContainText("Who owns follow-up?");
  await demo.getByRole("button", { name: "Reset" }).click();
  await demo.getByRole("button", { name: "Workflow", exact: true }).click();
  await expect(demo.getByLabel("Sample card stage")).toHaveValue("new");
  await expect(demo.getByLabel("What would you validate first?")).toBeEmpty();
  expect(writes).toEqual([]);
});

for (const width of [390, 1440]) {
  test(`pricing comparison is readable at ${width}px and leads to personal pricing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/pricing");
    const pricing = page.getByTestId("plan-comparison");
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing.locator('[data-plan="essentials"]')).toContainText(
      "€200",
    );
    await expect(pricing.locator('[data-plan="core"]')).toContainText("€700");
    await expect(pricing.locator('[data-plan="partner"]')).toContainText(
      "€1,000",
    );
    await expect(pricing.locator('[data-plan="core"]')).toContainText(
      "Best value",
    );
    await expect(pricing.locator('[data-plan="essentials"]')).toContainText(
      "No MODUS OS access",
    );
    await expect(
      pricing.getByRole("link", { name: "Get your personal price" }),
    ).toHaveAttribute("href", "/diagnostic");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  });
}
