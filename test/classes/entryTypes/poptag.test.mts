import { describe, expect, test } from 'vitest'
import { Poptag } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = 'poptag #berlin-trip-2014'
    const include = Poptag.fromString(input)
    expect(include.toString()).toEqual(input)
  })
})
