import { expect, test } from 'vitest'
import { parse } from '../../../src/parse.mjs'
import type { Open } from '../../../src/classes/entryTypes/index.mjs'

test('Parse simple', () => {
  // simplest open directive
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Open
  expect(entry.type).toBe('open')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.constraintCurrencies).toBeUndefined()
  expect(entry.bookingMethod).toBeUndefined()
})

test('Parse with single constraint currency', () => {
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Open
  expect(entry.type).toBe('open')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.constraintCurrencies).toEqual(['USD'])
  expect(entry.bookingMethod).toBeUndefined()
})

test('Parse with multiple constraint currency', () => {
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD,EUR'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Open
  expect(entry.type).toBe('open')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.constraintCurrencies).toEqual(['USD', 'EUR'])
  expect(entry.bookingMethod).toBeUndefined()
})

test('Parse with booking method', () => {
  const directive = '2014-05-01 open Liabilities:CreditCard:CapitalOne "FIFO"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Open
  expect(entry.type).toBe('open')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.constraintCurrencies).toBeUndefined()
  expect(entry.bookingMethod).toEqual('FIFO')
})

test('Parse with single constraint currency and booking method', () => {
  const directive =
    '2014-05-01 open Liabilities:CreditCard:CapitalOne USD "FIFO"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Open
  expect(entry.type).toBe('open')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.constraintCurrencies).toEqual(['USD'])
  expect(entry.bookingMethod).toEqual('FIFO')
})

test('Parse with multiple constraint currency and booking method', () => {
  const directive =
    '2014-05-01 open Liabilities:CreditCard:CapitalOne EUR,USD "FIFO"'
  const { entries } = parse(directive)
  expect(entries).toHaveLength(1)

  const entry = entries[0] as Open
  expect(entry.type).toBe('open')
  expect(entry.date.toJSON()).toBe('2014-05-01')
  expect(entry.account).toBe('Liabilities:CreditCard:CapitalOne')
  expect(entry.constraintCurrencies).toEqual(['EUR', 'USD'])
  expect(entry.bookingMethod).toEqual('FIFO')
})
