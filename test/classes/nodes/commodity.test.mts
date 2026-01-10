import { describe, expect, test } from 'vitest'
import { Commodity } from '../../../src/classes/nodes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = '1867-07-01 commodity CAD'
    const commodity = Commodity.fromString(input)
    expect(commodity.toString()).toEqual(input)
  })

  test('with metadata', () => {
    const input = `2012-01-01 commodity HOOL
  name: "Hooli Corporation Class C Shares"
  asset-class: "stock"`
    const commodity = Commodity.fromString(input)
    expect(commodity.toString()).toEqual(input)
  })

  test('with metadata (2)', () => {
    const input = `1900-01-01 commodity VMMXX
  export: "MUTF:VMMXX (MONEY:USD)"`
    const commodity = Commodity.fromString(input)
    expect(commodity.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input = '1867-07-01 commodity CAD'
    const commodity = Commodity.fromString(input)

    expect(Commodity.fromJSON(JSON.stringify(commodity))).toEqual(commodity)
  })

  test('with metadata', () => {
    const input = `2012-01-01 commodity HOOL
  name: "Hooli Corporation Class C Shares"
  asset-class: "stock"`
    const commodity = Commodity.fromString(input)

    expect(Commodity.fromJSON(JSON.stringify(commodity))).toEqual(commodity)
  })

  test('with metadata (2)', () => {
    const input = `1900-01-01 commodity VMMXX
  export: "MUTF:VMMXX (MONEY:USD)"`
    const commodity = Commodity.fromString(input)

    expect(Commodity.fromJSON(JSON.stringify(commodity))).toEqual(commodity)
  })
})
