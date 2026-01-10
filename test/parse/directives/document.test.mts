import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Document } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest document directive
  const directive =
    '2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Document
  expect(node.type).toBe('document')
  expect(node.date.toJSON()).toBe('2013-11-03')
  expect(node.account).toBe('Liabilities:CreditCard')
  expect(node.pathToDocument).toBe('/home/joe/stmts/apr-2014.pdf')
  expect(node.metadata).toBeUndefined()
})

test('Parse with metadata', () => {
  const directive = `
2013-11-03 document Liabilities:CreditCard "/home/joe/stmts/apr-2014.pdf"
  metadata-test: "value"
  metadata-test-boolean: TRUE
`
  const output = parse(directive)
  expect(output.document).toHaveLength(1)

  const node = output.document[0]
  expect(node.type).toBe('document')
  expect(node.date.toJSON()).toBe('2013-11-03')
  expect(node.account).toBe('Liabilities:CreditCard')
  expect(node.pathToDocument).toBe('/home/joe/stmts/apr-2014.pdf')
  expect(node.metadata).toEqual({
    'metadata-test': new Value({ type: 'string', value: 'value' }),
    'metadata-test-boolean': new Value({ type: 'boolean', value: true }),
  })
})
