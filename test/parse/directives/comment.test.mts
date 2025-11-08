import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Comment } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple (1)', () => {
  // simplest query directive
  const directive = '; this is a comment'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Comment
  expect(entry.type).toBe('comment')
  expect(entry.comment).toBe(directive)
})

test('Parse simple (2)', () => {
  // simplest query directive
  const directive = '%% COMMENT'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Comment
  expect(entry.type).toBe('comment')
  expect(entry.comment).toBe(directive)
})
