export function remapKeys(input: {}, mapFn: (inKey: string) => string): {} {
  return Object.entries(input).reduce(
    (acc: {}, entry: [string, {}]): {} => ({
      ...acc,
      [mapFn(entry[0])]: entry[1],
    }),
    {},
  )
}
