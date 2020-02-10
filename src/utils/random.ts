/**
 * Generates a cryptographically insecure random string
 * of a given size (16 symbols by default).
 * Alphabet: 0-9a-z.
 */
export function pseudoRandomString(length = 16): string {
  // tslint:disable-next-line no-let
  let token = ''

  // tslint:disable-next-line no-loop-statement
  while (token.length < length) {
    // tslint:disable-next-line no-expression-statement
    token += Math.random()
      .toString(36)
      .substr(2)
  }

  return token.substr(0, length)
}
