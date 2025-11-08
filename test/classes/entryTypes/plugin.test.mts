import { describe, expect, test } from 'vitest'
import { Plugin } from '../../../src/classes/entryTypes/index.mjs'

describe('Plugin class', () => {
  test('toString - simple', () => {
    const input = 'plugin "beancount.plugins.module_name"'
    const plugin = Plugin.fromString(input)
    expect(plugin.toString()).toEqual(input)
  })

  test('toString - with config', () => {
    const input = 'plugin "beancount.plugins.module_name" "configuration data"'
    const plugin = Plugin.fromString(input)
    expect(plugin.toString()).toEqual(input)
  })
})
