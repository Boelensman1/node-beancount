import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Comment } from '../../../src/classes/nodes/index.mjs'

test('Parse simple (1)', () => {
  // simplest query directive
  const directive = '; this is a comment'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Comment
  expect(node.type).toBe('comment')
  expect(node.comment).toBe(directive)
})

test('Parse simple (2)', () => {
  // simplest query directive
  const directive = '%% COMMENT'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Comment
  expect(node.type).toBe('comment')
  expect(node.comment).toBe(directive)
})
