import { describe, expect, test } from 'vitest'
import { Price } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = '2014-07-09 price HOOL 579.18 USD'
    const price = Price.fromString(input)
    expect(price.toString()).toEqual(input)
  })
})
