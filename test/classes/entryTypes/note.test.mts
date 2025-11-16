import { describe, expect, test } from 'vitest'
import { Note } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input =
      '2013-11-03 note Liabilities:CreditCard "Called about fraudulent card."'
    const note = Note.fromString(input)
    expect(note.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input =
      '2013-11-03 note Liabilities:CreditCard "Called about fraudulent card."'
    const note = Note.fromString(input)

    expect(Note.fromJSON(JSON.stringify(note))).toEqual(note)
  })
})
