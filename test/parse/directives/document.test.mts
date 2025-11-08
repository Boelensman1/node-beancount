import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Document } from '../../../src/classes/entryTypes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest document directive
  const directive =
    '2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Document
  expect(entry.type).toBe('document')
  expect(entry.date.toJSON()).toBe('2013-11-03')
  expect(entry.account).toBe('Liabilities:CreditCard')
  expect(entry.pathToDocument).toBe('/home/joe/stmts/apr-2014.pdf')
  expect(entry.metadata).toBeUndefined()
})

test('Parse with metadata', () => {
  const directive = `
2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"
  metadata-test: "value"
  metadata-test-boolean: TRUE
`
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Document
  expect(entry.type).toBe('document')
  expect(entry.date.toJSON()).toBe('2013-11-03')
  expect(entry.account).toBe('Liabilities:CreditCard')
  expect(entry.pathToDocument).toBe('/home/joe/stmts/apr-2014.pdf')
  expect(entry.metadata).toEqual({
    'metadata-test': new Value({ type: 'string', value: 'value' }),
    'metadata-test-boolean': new Value({ type: 'boolean', value: true }),
  })
})
