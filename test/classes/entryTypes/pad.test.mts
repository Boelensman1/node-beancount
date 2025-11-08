import { describe, expect, test } from 'vitest'
import { Pad } from '../../../src/classes/entryTypes/index.mjs'

describe('Pad class', () => {
  test('toString', () => {
    const input = '2014-06-01 pad Assets:BofA:Checking Equity:Opening-Balances'
    const pad = Pad.fromString(input)
    expect(pad.toString()).toEqual(input)
  })
})
