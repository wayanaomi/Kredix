import { describe, it, expect } from "vitest";
import {
  nairaToKobo,
  koboToNaira,
  formatNgn,
} from "../src/lib/money";

describe("money helpers", () => {
  it("converts naira to kobo exactly", () => {
    expect(nairaToKobo(100)).toBe(10000);
    expect(nairaToKobo(12.5)).toBe(1250);
  });

  it("rejects negative amounts", () => {
    expect(() => nairaToKobo(-1)).toThrow();
  });

  it("formats kobo as NGN currency", () => {
    expect(formatNgn(1200000)).toContain("12,000");
  });

  it("round-trips kobo/naira conversion", () => {
    expect(koboToNaira(nairaToKobo(42))).toBe(42);
  });
});
