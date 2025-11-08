import { describe, expect, test } from 'vitest'
import { Plugin } from '../../../src/classes/entryTypes/index.mjs'

describe('Plugin class', () => {
  test('toString', () => {
    const input = 'plugin "beancount.plugins.module_name"'
    const plugin = Plugin.fromString(input)
    expect(plugin.toString()).toEqual(input)
  })
})
