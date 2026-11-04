/**
 * Money is always represented as integer minor units (kobo). 1 NGN = 100 kobo.
 * Never use floating-point arithmetic for monetary values.
 */

export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira) || naira < 0) {
    throw new Error("Invalid naira amount");
  }
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function formatNgn(kobo: number): string {
  const naira = koboToNaira(kobo);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: naira % 1 === 0 ? 0 : 2,
  }).format(naira);
}

export function sumMinor(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
