import { describe, expect, test } from 'vitest'
import { Document } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input =
      '2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"'
    const document = Document.fromString(input)
    expect(document.toString()).toEqual(input)
  })

  test('with space', () => {
    const input =
      '2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr 2014.pdf"'
    const document = Document.fromString(input)
    expect(document.toString()).toEqual(input)
  })

  test('with metadata', () => {
    const input = `2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"
  metadata-test: "value"
  metadata-test-boolean: TRUE`
    const document = Document.fromString(input)
    expect(document.toString()).toEqual(input)
  })
})

describe('toJSON & fromJSON roundtrip', () => {
  test('simple', () => {
    const input =
      '2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"'
    const document = Document.fromString(input)

    expect(Document.fromJSON(JSON.stringify(document))).toEqual(document)
  })

  test('with metadata', () => {
    const input = `2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"
  metadata-test: "value"
  metadata-test-boolean: TRUE`
    const document = Document.fromString(input)

    expect(Document.fromJSON(JSON.stringify(document))).toEqual(document)
  })
})
