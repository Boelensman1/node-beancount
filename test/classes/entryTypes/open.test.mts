import { describe, expect, test } from 'vitest'
import { Open } from '../../../src/classes/entryTypes/index.mjs'

describe('Open class', () => {
  test('toString', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })
})
