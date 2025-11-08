import { describe, expect, test } from 'vitest'
import { Document } from '../../../src/classes/entryTypes/index.mjs'

describe('Document class', () => {
  test('toString', () => {
    const input =
      '2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"'
    const document = Document.fromString(input)
    expect(document.toString()).toEqual(input)
  })
})
