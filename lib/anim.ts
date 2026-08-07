export function animClass(base: string, index?: number) {
  const delay = index !== undefined ? ` delay-${Math.min((index + 1) * 100, 500)}` : "";
  return `${base}${delay}`;
}
