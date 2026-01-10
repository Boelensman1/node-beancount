import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Open } from '../../../src/classes/nodes/index.mjs'

test('Parse simple', () => {
  // simplest open directive
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Open
  expect(node.type).toBe('open')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.constraintCurrencies).toBeUndefined()
  expect(node.bookingMethod).toBeUndefined()
})

test('Parse with single constraint currency', () => {
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Open
  expect(node.type).toBe('open')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.constraintCurrencies).toEqual(['USD'])
  expect(node.bookingMethod).toBeUndefined()
})

test('Parse with multiple constraint currency', () => {
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD,EUR'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Open
  expect(node.type).toBe('open')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.constraintCurrencies).toEqual(['USD', 'EUR'])
  expect(node.bookingMethod).toBeUndefined()
})

test('Parse with booking method', () => {
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne "FIFO"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Open
  expect(node.type).toBe('open')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.constraintCurrencies).toBeUndefined()
  expect(node.bookingMethod).toEqual('FIFO')
})

test('Parse with single constraint currency and booking method', () => {
  const directive =
    '2014-05-01 open Liabilities:CreditCard:CapitalOne USD "FIFO"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Open
  expect(node.type).toBe('open')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.constraintCurrencies).toEqual(['USD'])
  expect(node.bookingMethod).toEqual('FIFO')
})

test('Parse with multiple constraint currency and booking method', () => {
  const directive =
    '2014-05-01 open Liabilities:CreditCard:CapitalOne EUR,USD "FIFO"'
  const { nodes } = parse(directive)
  expect(nodes).toHaveLength(1)

  const node = nodes[0] as Open
  expect(node.type).toBe('open')
  expect(node.date.toJSON()).toBe('2014-05-01')
  expect(node.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(node.constraintCurrencies).toEqual(['EUR', 'USD'])
  expect(node.bookingMethod).toEqual('FIFO')
})
