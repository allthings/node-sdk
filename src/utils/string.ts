export function camelCaseToDash(input: string): string {
  return input.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`)
}

export function dashCaseToCamel(input: string): string {
  return input.replace(/-([a-z])/g, g => g[1].toUpperCase())
}
