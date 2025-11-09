import { describe, expect, test } from 'vitest'
import { Pushtag } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = 'pushtag #berlin-trip-2014'
    const include = Pushtag.fromString(input)
    expect(include.toString()).toEqual(input)
  })
})
