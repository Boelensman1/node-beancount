import { describe, expect, test } from 'vitest'
import { Close } from '../../../src/classes/entryTypes/index.mjs'

describe('Close class', () => {
  test('toString', () => {
    const input = '2014-05-01 close Liabilities:CreditCard:CapitalOne'
    const close = Close.fromString(input)
    expect(close.toString()).toEqual(input)
  })
})
