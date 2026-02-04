import { describe, expect, test } from 'vitest'
import { assertNodeConstructor, Node } from '../../src/main.mjs'

class TestNodeClass extends Node {
  type = 'comment' as const

  prop1!: number
  prop2!: string
  prop3!: string

  static fromGenericParseResult(): TestNodeClass {
    return new TestNodeClass({})
  }
}

// Ensure class conforms to NodeConstructor pattern
assertNodeConstructor(TestNodeClass)

describe('Node class', () => {
  describe('constructor', () => {
    test('Trims strings', () => {
      const inp = {
        prop1: 0 /* not a string */,
        prop2: 'a string',
        prop3: ' a string with extra spaces ',
      }
      const testObj = new TestNodeClass(inp)
      expect(testObj.prop1).toBe(inp.prop1)
      expect(testObj.prop2).toBe(inp.prop2)
      expect(testObj.prop3).toBe(inp.prop3.trim())
    })
  })
})
