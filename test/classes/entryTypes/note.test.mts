import { describe, expect, test } from 'vitest'
import { Note } from '../../../src/classes/entryTypes/index.mjs'

describe('Note class', () => {
  test('toString', () => {
    const input =
      '2013-11-03 note Liabilities:CreditCard "Called about fraudulent card."'
    const note = Note.fromString(input)
    expect(note.toString()).toEqual(input)
  })
})
