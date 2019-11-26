export function remapKeys(
  input: { readonly [key: string]: any },
  mapFn: (inKey: string) => string,
): { readonly [key: string]: any } {
  return Object.entries(input).reduce(
    (acc: {}, entry): {} => ({
      ...acc,
      [mapFn(entry[0])]: entry[1],
    }),
    {},
  )
}
