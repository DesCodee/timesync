export function cls(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function anim(base: string, index?: number) {
  const delay = index !== undefined && index > 0 ? ` delay-${Math.min(index + 1, 6)}` : "";
  return `${base}${delay}`;
}
