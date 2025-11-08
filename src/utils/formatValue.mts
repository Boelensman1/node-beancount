import type { Value } from './parseVal.mjs'

export const formatValue = (value: Value): string => {
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }
  return `"${value}"`
}
