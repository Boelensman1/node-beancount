import { describe, expect, test } from 'vitest'
import {
  deserializeNodes,
  deserializeNodesFromString,
} from '../../src/deserialize.mjs'
import {
  Open,
  Transaction,
  Balance,
  Close,
  Comment,
  Blankline,
  Include,
  Option,
  Pad,
  Plugin,
  Poptag,
  Price,
  Pushtag,
  Query,
  Commodity,
  Custom,
  Document,
  Event,
  Note,
} from '../../src/classes/nodes/index.mjs'

describe('deserializeNodes', () => {
  describe('valid inputs', () => {
    test('deserialize empty array', () => {
      const nodesData: Record<string, unknown>[] = []
      const nodes = deserializeNodes(nodesData)
      expect(nodes).toEqual([])
    })

    test('deserialize single node array', () => {
      const node = Open.fromString('2024-01-01 open Assets:Checking')
      const nodesData = [node.toJSON()]
      const nodes = deserializeNodes(nodesData)
      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toEqual(node)
    })

    test('deserialize array of mixed node types', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking'),
        Balance.fromString('2024-01-02 balance Assets:Checking 100.00 USD'),
        Transaction.fromString(`2024-01-03 * "Payee" "Narration"
  Assets:Checking  -50.00 USD
  Expenses:Food     50.00 USD`),
        Comment.fromString('; comment'),
      ]
      const nodesData = original.map((e) => e.toJSON())
      const nodes = deserializeNodes(nodesData)
      expect(nodes).toHaveLength(4)
      expect(nodes).toEqual(original)
    })

    test('roundtrip serialization for array of nodes', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking USD'),
        Close.fromString('2024-12-31 close Assets:Checking'),
        Transaction.fromString(`2024-06-15 * "Store" "Purchase" #shopping
  Assets:Checking  -25.00 USD
  Expenses:Shopping 25.00 USD`),
      ]
      const nodesData = original.map((e) => e.toJSON())
      const deserialized = deserializeNodes(nodesData)
      expect(deserialized).toEqual(original)
    })

    test('deserialize array with all node types', () => {
      const original = [
        Balance.fromString('2024-01-01 balance Assets:Checking 100.00 USD'),
        Blankline.fromString(''),
        Close.fromString('2024-01-01 close Assets:Checking'),
        Comment.fromString('; comment'),
        Commodity.fromString('2024-01-01 commodity USD'),
        Custom.fromString('2024-01-01 custom "budget" Assets:Checking'),
        Document.fromString(
          '2024-01-01 document Assets:Checking "path/to/file.pdf"',
        ),
        Event.fromString('2024-01-01 event "location" "New York"'),
        Include.fromString('include "other.beancount"'),
        Note.fromString('2024-01-01 note Assets:Checking "Note text"'),
        Open.fromString('2024-01-01 open Assets:Checking'),
        Option.fromString('option "operating_currency" "USD"'),
        Pad.fromString('2024-01-01 pad Assets:Checking Equity:Opening'),
        Plugin.fromString('plugin "beancount.plugins.auto_accounts"'),
        Poptag.fromString('poptag #tag'),
        Price.fromString('2024-01-01 price USD 1.00 EUR'),
        Pushtag.fromString('pushtag #tag'),
        Query.fromString('2024-01-01 query "name" "SELECT *"'),
        Transaction.fromString(`2024-01-01 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`),
      ]
      const nodesData = original.map((e) => e.toJSON())
      const deserialized = deserializeNodes(nodesData)
      expect(deserialized).toEqual(original)
    })
  })

  describe('error handling', () => {
    test('throws on non-array input (string)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodes('not an array')).toThrow(
        'Invalid input: expected an array but received string',
      )
    })

    test('throws on non-array input (object)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodes({ type: 'open' })).toThrow(
        'Invalid input: expected an array but received object',
      )
    })

    test('throws on non-array input (null)', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodes(null)).toThrow(
        'Invalid input: expected an array but received object',
      )
    })

    test('throws on invalid node in array with index', () => {
      const nodesData = [
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'invalid_type', date: '2024-01-02' },
        { type: 'close', date: '2024-01-03', account: 'Assets:Checking' },
      ]
      try {
        deserializeNodes(nodesData)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize node at index 1')
        expect(message).toContain('Unknown node type: "invalid_type"')
      }
    })

    test('throws with correct index when first node is invalid', () => {
      const nodesData = [
        { type: 'unknown' },
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
      ]
      expect(() => deserializeNodes(nodesData)).toThrow(
        /Failed to deserialize node at index 0/,
      )
    })

    test('throws with correct index when last node is invalid', () => {
      const nodesData = [
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'close', date: '2024-01-02', account: 'Assets:Checking' },
        { missing_type: true },
      ]
      try {
        deserializeNodes(nodesData)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize node at index 2')
        expect(message).toContain('missing required "type" field')
      }
    })

    test('error propagates from deserializeNodes', () => {
      const nodesData = [
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        null,
      ]
      // @ts-expect-error testing invalid input
      expect(() => deserializeNodes(nodesData)).toThrow(
        /Failed to deserialize node at index 1/,
      )
    })
  })
})

describe('deserializeNodesFromString', () => {
  describe('valid inputs', () => {
    test('deserialize empty array', () => {
      const json = '[]'
      const nodes = deserializeNodesFromString(json)
      expect(nodes).toEqual([])
    })

    test('deserialize single node array', () => {
      const node = Open.fromString('2024-01-01 open Assets:Checking')
      const json = JSON.stringify([node.toJSON()])
      const nodes = deserializeNodesFromString(json)
      expect(nodes).toHaveLength(1)
      expect(nodes[0]).toEqual(node)
    })

    test('deserialize array of mixed node types', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking'),
        Balance.fromString('2024-01-02 balance Assets:Checking 100.00 USD'),
        Transaction.fromString(`2024-01-03 * "Payee" "Narration"
  Assets:Checking  -50.00 USD
  Expenses:Food     50.00 USD`),
        Comment.fromString('; comment'),
      ]
      const json = JSON.stringify(original.map((e) => e.toJSON()))
      const nodes = deserializeNodesFromString(json)
      expect(nodes).toHaveLength(4)
      expect(nodes).toEqual(original)
    })

    test('roundtrip serialization for array of nodes', () => {
      const original = [
        Open.fromString('2024-01-01 open Assets:Checking USD'),
        Close.fromString('2024-12-31 close Assets:Checking'),
        Transaction.fromString(`2024-06-15 * "Store" "Purchase" #shopping
  Assets:Checking  -25.00 USD
  Expenses:Shopping 25.00 USD`),
      ]
      const json = JSON.stringify(original.map((e) => e.toJSON()))
      const deserialized = deserializeNodesFromString(json)
      expect(deserialized).toEqual(original)
    })

    test('deserialize array with all node types', () => {
      const original = [
        Balance.fromString('2024-01-01 balance Assets:Checking 100.00 USD'),
        Blankline.fromString(''),
        Close.fromString('2024-01-01 close Assets:Checking'),
        Comment.fromString('; comment'),
        Commodity.fromString('2024-01-01 commodity USD'),
        Custom.fromString('2024-01-01 custom "budget" Assets:Checking'),
        Document.fromString(
          '2024-01-01 document Assets:Checking "path/to/file.pdf"',
        ),
        Event.fromString('2024-01-01 event "location" "New York"'),
        Include.fromString('include "other.beancount"'),
        Note.fromString('2024-01-01 note Assets:Checking "Note text"'),
        Open.fromString('2024-01-01 open Assets:Checking'),
        Option.fromString('option "operating_currency" "USD"'),
        Pad.fromString('2024-01-01 pad Assets:Checking Equity:Opening'),
        Plugin.fromString('plugin "beancount.plugins.auto_accounts"'),
        Poptag.fromString('poptag #tag'),
        Price.fromString('2024-01-01 price USD 1.00 EUR'),
        Pushtag.fromString('pushtag #tag'),
        Query.fromString('2024-01-01 query "name" "SELECT *"'),
        Transaction.fromString(`2024-01-01 * "Payee" "Narration"
  Assets:Checking  -100.00 USD
  Expenses:Food     100.00 USD`),
      ]
      const json = JSON.stringify(original.map((e) => e.toJSON()))
      const deserialized = deserializeNodesFromString(json)
      expect(deserialized).toEqual(original)
    })
  })

  describe('error handling', () => {
    test('throws on non-string input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodesFromString(123)).toThrow(
        'Invalid input: expected a JSON string but received number',
      )
    })

    test('throws on object input', () => {
      // @ts-expect-error wrong type
      expect(() => deserializeNodesFromString({})).toThrow(
        'Invalid input: expected a JSON string but received object',
      )
    })

    test('throws on invalid JSON syntax', () => {
      const invalidJson = '{invalid json'
      expect(() => deserializeNodesFromString(invalidJson)).toThrow(
        /Failed to parse JSON:/,
      )
    })

    test('throws on non-array JSON', () => {
      const json = '{"type": "open", "date": "2024-01-01"}'
      expect(() => deserializeNodesFromString(json)).toThrow(
        'Invalid JSON structure: expected an array but received object',
      )
    })

    test('throws on invalid node in array with index', () => {
      const json = JSON.stringify([
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'invalid_type', date: '2024-01-02' },
        { type: 'close', date: '2024-01-03', account: 'Assets:Checking' },
      ])
      try {
        deserializeNodesFromString(json)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize node at index 1')
        expect(message).toContain('Unknown node type: "invalid_type"')
      }
    })

    test('throws with correct index when first node is invalid', () => {
      const json = JSON.stringify([
        { type: 'unknown' },
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
      ])
      expect(() => deserializeNodesFromString(json)).toThrow(
        /Failed to deserialize node at index 0/,
      )
    })

    test('throws with correct index when last node is invalid', () => {
      const json = JSON.stringify([
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        { type: 'close', date: '2024-01-02', account: 'Assets:Checking' },
        { missing_type: true },
      ])
      try {
        deserializeNodesFromString(json)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const message = (error as Error).message
        expect(message).toContain('Failed to deserialize node at index 2')
        expect(message).toContain('missing required "type" field')
      }
    })

    test('error propagates from deserializeNodes', () => {
      const json = JSON.stringify([
        { type: 'open', date: '2024-01-01', account: 'Assets:Checking' },
        null,
      ])
      expect(() => deserializeNodesFromString(json)).toThrow(
        /Failed to deserialize node at index 1/,
      )
    })
  })
})
