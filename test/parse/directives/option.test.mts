import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Option } from '../../../src/classes/nodes/index.mjs'
import { Value } from '../../../src/classes/Value.mjs'

test('Parse simple', () => {
  // simplest option directive
  const directive = 'option "title" "Ed’s Personal Ledger"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Option
  expect(node.type).toBe('option')
  expect(node.name).toBe('title')
  expect(node.value).toEqual(
    new Value({ type: 'string', value: 'Ed’s Personal Ledger' }),
  )
})
