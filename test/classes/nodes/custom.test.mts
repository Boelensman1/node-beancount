import { describe, expect, test } from 'vitest'
import { Custom } from '../../../src/classes/nodes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = '2014-07-09 custom "budget"'
    const custom = Custom.fromString(input)
    expect(custom.toString()).toEqual(input)
  })

  test('with values', () => {
    const input = '2014-07-09 custom "budget" "..." TRUE 45.30 USD'
    const custom = Custom.fromString(input)
    expect(custom.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input = '2014-07-09 custom "budget"'
    const custom = Custom.fromString(input)

    expect(Custom.fromJSON(JSON.stringify(custom))).toEqual(custom)
  })

  test('with values', () => {
    const input = '2014-07-09 custom "budget" "..." TRUE 45.30 USD'
    const custom = Custom.fromString(input)

    expect(Custom.fromJSON(JSON.stringify(custom))).toEqual(custom)
  })
})
