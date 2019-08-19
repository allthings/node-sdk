// tslint:disable no-expression-statement
import { pseudoRandomString } from './random'

describe('pseudoRandomString', () => {
  it('returns a string containing 16 symbols 0-9a-z', () => {
    expect(pseudoRandomString()).toMatch(/^[0-9a-z]{16}$/)
  })

  it('returns a string containing having specified length', () => {
    expect(pseudoRandomString(10)).toMatch(/^[0-9a-z]{10}$/)
  })
})
