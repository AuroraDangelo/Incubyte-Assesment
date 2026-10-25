export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

/** Paint-chip colours so each body style is recognisable at a glance. */
const SWATCHES = ['#0E5A45', '#B3261E', '#2F5D9E', '#C9892B', '#5B4B8A', '#3E3E3E', '#8A9A2F', '#B05A7A'];
export function swatchFor(category: string): string {
  let h = 0;
  for (const ch of category.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}
