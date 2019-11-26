type List<T> = ReadonlyArray<T>

declare namespace NodeJS {
  interface Global {
    readonly window: any
  }
}

declare module '*.json' {
  const value: any
  export const version: string
  export default value
}
