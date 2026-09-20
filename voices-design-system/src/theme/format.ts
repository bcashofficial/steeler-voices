/** A count with thousands separated: 4212 → "4,212". */
export const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(value));
