import { describe, expect, test } from 'vitest'
import { Pad } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = '2014-06-01 pad Assets:BofA:Checking Equity:Opening-Balances'
    const pad = Pad.fromString(input)
    expect(pad.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input = '2014-06-01 pad Assets:BofA:Checking Equity:Opening-Balances'
    const pad = Pad.fromString(input)

    expect(Pad.fromJSON(JSON.stringify(pad))).toEqual(pad)
  })
})
