import { describe, expect, it } from "vitest";
import { submissionHistory, REVIEW_STEPS } from "./workspace";
import { STATUSES } from "./types";

describe("workspace evidence", () => {
  it("counts real UTC dates, excludes old and future records, and keeps empty days at zero", () => {
    const data = submissionHistory(
      [
        "2026-10-01T23:30:00-02:00",
        "2026-10-02T14:00:00Z",
        "2026-09-01",
        "2026-10-04",
        "invalid",
      ],
      new Date("2026-10-03T12:00:00Z"),
      3,
    );
    expect(data).toEqual([
      { date: "2026-10-01", count: 0 },
      { date: "2026-10-02", count: 2 },
      { date: "2026-10-03", count: 0 },
    ]);
  });
  it("explains every persisted stage without folding qualified or reviewed into another stage", () => {
    expect(Object.keys(REVIEW_STEPS)).toEqual([...STATUSES]);
    expect(REVIEW_STEPS.QUALIFIED.next).toContain("scope");
    expect(REVIEW_STEPS.REVIEWED).not.toEqual(REVIEW_STEPS.REVIEWING);
  });
});
