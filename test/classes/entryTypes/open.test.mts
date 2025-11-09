import { describe, expect, test } from 'vitest'
import { Open } from '../../../src/classes/entryTypes/index.mjs'

describe('toString', () => {
  test('simple', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('with single constraint currency', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('with multiple constraint currencies', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD,EUR'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('with booking method', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne "FIFO"'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('with single constraint currency and booking method', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD "FIFO"'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('with multiple constraint currencies and booking method', () => {
    const input =
      '2014-05-01 open Liabilities:CreditCard:CapitalOne EUR,USD "FIFO"'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })
})

describe('format', () => {
  test('basic', () => {
    const input = '2023-01-01 open Assets:US:BofA:Checking USD'
    const entry = Open.fromString(input)
    const formatOptions = {
      currencyColumn: 59,
    }
    expect(entry.toFormattedString(formatOptions)).toEqual(
      '2023-01-01 open Assets:US:BofA:Checking                   USD',
    )
  })
})
