import { describe, expect, test } from 'vitest'
import { Include } from '../../../src/classes/nodes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = 'include "path/to/include/file.beancount"'
    const include = Include.fromString(input)
    expect(include.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input = 'include "path/to/include/file.beancount"'
    const include = Include.fromString(input)

    expect(Include.fromJSON(JSON.stringify(include))).toEqual(include)
  })
})
