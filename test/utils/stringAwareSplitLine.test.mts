import { describe, expect, it } from 'vitest'
import { stringAwareSplitLine } from '../../src/utils/stringAwareSplitLine.mjs'

describe('stringAwareSplitLine', () => {
  it('should split simple unquoted lines', () => {
    expect(stringAwareSplitLine('line1\nline2\nline3')).toEqual([
      'line1',
      'line2',
      'line3',
    ])
  })

  it('should handle the example case: quoted newlines and unquoted content', () => {
    expect(stringAwareSplitLine('"\n\n\n"\n"def\nxxx"')).toEqual([
      '"\n\n\n"',
      '"def\nxxx"',
    ])
  })

  it('should keep quoted strings with newlines together', () => {
    expect(stringAwareSplitLine('"line1\nline2"\nline3')).toEqual([
      '"line1\nline2"',
      'line3',
    ])
  })

  it('should keep empty strings from consecutive newlines', () => {
    expect(stringAwareSplitLine('a\n\nb')).toEqual(['a', '', 'b'])
  })

  it('should handle multiple consecutive newlines', () => {
    expect(stringAwareSplitLine('a\n\n\nb')).toEqual(['a', '', '', 'b'])
  })

  it('should handle escaped quotes within quoted strings', () => {
    expect(stringAwareSplitLine('"line with \\" quote"\nline2')).toEqual([
      '"line with \\" quote"',
      'line2',
    ])
  })

  it('should handle escaped quotes with newlines inside', () => {
    expect(stringAwareSplitLine('"a\\"b\\nc"')).toEqual(['"a\\"b\\nc"'])
  })

  it('should throw error for unclosed quotes', () => {
    expect(() => stringAwareSplitLine('"unclosed')).toThrow(
      'Unclosed quote in input string',
    )
  })

  it('should throw error for unclosed quotes with newlines', () => {
    expect(() => stringAwareSplitLine('"unclosed\nline')).toThrow(
      'Unclosed quote in input string',
    )
  })

  it('should handle empty string', () => {
    expect(stringAwareSplitLine('')).toEqual([''])
  })

  it('should handle only newlines', () => {
    expect(stringAwareSplitLine('\n\n')).toEqual(['', '', ''])
  })

  it('should handle mixed quoted and unquoted content', () => {
    expect(stringAwareSplitLine('start\n"quoted\npart"\nend')).toEqual([
      'start',
      '"quoted\npart"',
      'end',
    ])
  })

  it('should handle string ending with newline', () => {
    expect(stringAwareSplitLine('line1\nline2\n')).toEqual([
      'line1',
      'line2',
      '',
    ])
  })

  it('should handle string starting with newline', () => {
    expect(stringAwareSplitLine('\nline1\nline2')).toEqual([
      '',
      'line1',
      'line2',
    ])
  })

  it('should handle only quoted string', () => {
    expect(stringAwareSplitLine('"just quoted"')).toEqual(['"just quoted"'])
  })

  it('should handle adjacent quoted strings', () => {
    expect(stringAwareSplitLine('"first""second"\n"third"')).toEqual([
      '"first""second"',
      '"third"',
    ])
  })

  it('should handle real-world line', () => {
    expect(
      stringAwareSplitLine(
        `
2014-07-09 query "france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"
  description: "Query to find all cash positions"
  frequency: "monthly"`,
      ),
    ).toEqual([
      '',
      `2014-07-09 query "france-balances" "


  SELECT account, sum(position) WHERE ‘trip-france-2014’ in tags"`,
      '  description: "Query to find all cash positions"',
      '  frequency: "monthly"',
    ])
  })
})
