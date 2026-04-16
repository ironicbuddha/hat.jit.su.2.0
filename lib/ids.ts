export function createId(prefix: string): string {
  const segment = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  return `${prefix}_${segment}`;
}
