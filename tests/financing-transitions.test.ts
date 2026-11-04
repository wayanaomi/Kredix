import { describe, it, expect } from "vitest";
import { FINANCING_STATUS_TRANSITIONS } from "../src/lib/enums";

describe("financing status transitions", () => {
  it("allows SUBMITTED -> UNDER_REVIEW or DECLINED", () => {
    expect(FINANCING_STATUS_TRANSITIONS.SUBMITTED).toEqual(["UNDER_REVIEW", "DECLINED"]);
  });

  it("does not allow skipping straight to DISBURSED from SUBMITTED", () => {
    expect(FINANCING_STATUS_TRANSITIONS.SUBMITTED).not.toContain("DISBURSED");
  });

  it("has no outgoing transitions from terminal states", () => {
    expect(FINANCING_STATUS_TRANSITIONS.DISBURSED).toEqual([]);
    expect(FINANCING_STATUS_TRANSITIONS.DECLINED).toEqual([]);
  });
});
