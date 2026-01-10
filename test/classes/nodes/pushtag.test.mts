import { describe, expect, test } from 'vitest'
import { Pushtag } from '../../../src/classes/nodes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = 'pushtag #berlin-trip-2014'
    const include = Pushtag.fromString(input)
    expect(include.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input = 'pushtag #berlin-trip-2014'
    const pushtag = Pushtag.fromString(input)

    expect(Pushtag.fromJSON(JSON.stringify(pushtag))).toEqual(pushtag)
  })
})
