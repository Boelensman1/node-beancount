import { describe, expect, test } from 'vitest'
import { Include } from '../../../src/classes/entryTypes/index.mjs'

describe('Include class', () => {
  test('toString', () => {
    const input = 'include "path/to/include/file.beancount"'
    const include = Include.fromString(input)
    expect(include.toString()).toEqual(input)
  })
})
