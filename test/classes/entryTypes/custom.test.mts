import { describe, expect, test } from 'vitest'
import { Custom } from '../../../src/classes/entryTypes/index.mjs'

describe('Custom class', () => {
  test('toString', () => {
    const input = '2014-07-09 custom "budget"'
    const custom = Custom.fromString(input)
    expect(custom.toString()).toEqual(input)
  })
})
