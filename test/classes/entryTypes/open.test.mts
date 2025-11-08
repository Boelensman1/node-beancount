import { describe, expect, test } from 'vitest'
import { Open } from '../../../src/classes/entryTypes/index.mjs'

describe('Open class', () => {
  test('toString - simple', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('toString - with single constraint currency', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('toString - with multiple constraint currencies', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD,EUR'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('toString - with booking method', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne "FIFO"'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('toString - with single constraint currency and booking method', () => {
    const input = '2014-05-01 open Liabilities:CreditCard:CapitalOne USD "FIFO"'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })

  test('toString - with multiple constraint currencies and booking method', () => {
    const input =
      '2014-05-01 open Liabilities:CreditCard:CapitalOne EUR,USD "FIFO"'
    const open = Open.fromString(input)
    expect(open.toString()).toEqual(input)
  })
})
