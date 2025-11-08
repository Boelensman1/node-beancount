import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Plugin } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest plugin directive
  const directive = 'plugin "beancount.plugins.module_name"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Plugin
  expect(entry.type).toBe('plugin')
  expect(entry.moduleName).toBe('beancount.plugins.module_name')
  expect(entry.config).toBeUndefined()
})

test('Parse with config', () => {
  // simplest plugin directive
  const directive =
    'plugin "beancount.plugins.module_name" "configuration data"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Plugin
  expect(entry.type).toBe('plugin')
  expect(entry.moduleName).toBe('beancount.plugins.module_name')
  expect(entry.config).toBe('configuration data')
})
