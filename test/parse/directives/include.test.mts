import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Include } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest include directive
  const directive = 'include "path/to/include/file.beancount"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Include
  expect(node.type).toBe('include')
  expect(node.filename).toBe('path/to/include/file.beancount')
})
