import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Pushtag } from '../../../src/classes/nodes/index.mjs'
import { Tag } from '../../../src/classes/nodes/Transaction/Tag.mjs'

test('Parse simple', () => {
  // simplest include directive
  const directive = 'pushtag #berlin-trip-2014'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Pushtag
  expect(node.type).toBe('pushtag')
  expect(node.tag).toEqual(
    new Tag({ content: 'berlin-trip-2014', fromStack: true }),
  )
})
