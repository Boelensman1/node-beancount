import { describe, expect, test } from 'vitest'
import { Option } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = 'option "title" "Ed\'s Personal Ledger"'
    const option = Option.fromString(input)
    expect(option.toString()).toEqual(input)
  })
})
