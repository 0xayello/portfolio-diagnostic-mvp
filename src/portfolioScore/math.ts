export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const absDiff = (a: number, b: number) => Math.abs(a - b);

/** normaliza eventuais overs: arredonda 2 casas */
export const norm = (v: number) => clamp(Number(v.toFixed(2)));

/** soma segura e normaliza */
export const weighted = (pairs: Array<[number, number]>) => {
  const totalWeight = pairs.reduce((acc, [, w]) => acc + w, 0);
  const score = pairs.reduce((acc, [s, w]) => acc + s * w, 0);
  return norm(score / (totalWeight || 1));
};


