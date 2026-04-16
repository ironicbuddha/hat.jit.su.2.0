export function nowIso(date = new Date()): string {
  return date.toISOString();
}

export function plusSeconds(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}
