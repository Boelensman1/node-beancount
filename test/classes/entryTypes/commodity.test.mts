import { describe, expect, test } from 'vitest'
import { Commodity } from '../../../src/classes/entryTypes/index.mjs'

describe('Commodity class', () => {
  test('toString', () => {
    const input = '1867-07-01 commodity CAD'
    const commodity = Commodity.fromString(input)
    expect(commodity.toString()).toEqual(input)
  })
})
