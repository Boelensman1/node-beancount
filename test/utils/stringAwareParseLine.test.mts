import { expect, test } from 'vitest'
import { stringAwareParseLine } from '../../src/utils/stringAwareParseLine.mjs'

test('Parse simple quoted strings', () => {
  const line = '"location" "Paris, France"'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"location"', '"Paris, France"'])
})

test('Parse quoted string with spaces', () => {
  const line = '"hello world" "foo bar"'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"hello world"', '"foo bar"'])
})

test('Parse mixed quoted and unquoted values', () => {
  const line = '"location" TRUE'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"location"', 'TRUE'])
})

test('Parse quoted and numeric values', () => {
  const line = '"location" 23.01'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"location"', '23.01'])
})

test('Parse single quoted string', () => {
  const line = '"single value"'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"single value"'])
})

test('Parse multiple unquoted values', () => {
  const line = 'foo bar baz'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['foo', 'bar', 'baz'])
})

test('Parse with extra spaces', () => {
  const line = '"location"  "Paris, France"'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"location"', '"Paris, France"'])
})

test('Parse empty string', () => {
  const line = ''
  const result = stringAwareParseLine(line)
  expect(result).toEqual([])
})

test('Parse quoted string with special characters', () => {
  const line = '"name" "value with: special, chars!"'
  const result = stringAwareParseLine(line)
  expect(result).toEqual(['"name"', '"value with: special, chars!"'])
})
