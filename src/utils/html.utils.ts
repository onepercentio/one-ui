export function isSameTarget({ target, currentTarget }: Event) {
  return target === currentTarget;
}
