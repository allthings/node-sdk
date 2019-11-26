// Convert a date string to a Javascript Date object
export function stringToDate(s: string): Date {
  return new Date(Date.parse(s))
}

export function dateToString(d: Date): string {
  return d.toISOString()
}
