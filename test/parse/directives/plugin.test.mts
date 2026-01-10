import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Plugin } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest plugin directive
  const directive = 'plugin "beancount.plugins.module_name"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Plugin
  expect(node.type).toBe('plugin')
  expect(node.moduleName).toBe('beancount.plugins.module_name')
  expect(node.config).toBeUndefined()
})

test('Parse with config', () => {
  // simplest plugin directive
  const directive =
    'plugin "beancount.plugins.module_name" "configuration data"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Plugin
  expect(node.type).toBe('plugin')
  expect(node.moduleName).toBe('beancount.plugins.module_name')
  expect(node.config).toBe('configuration data')
})
