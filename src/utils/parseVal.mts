export type Value = string | boolean

export const parseString = (val: string): string => {
  return val.replace(/^"|"$/g, '')
}
export const parseVal = (val: string): Value => {
  if (val.startsWith('"') && val.endsWith('"')) {
    // string!
    return parseString(val)
  }
  if (val.toUpperCase() === 'TRUE') {
    return true
  }
  if (val.toUpperCase() === 'FALSE') {
    return false
  }
  return val
}
