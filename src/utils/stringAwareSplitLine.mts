export const stringAwareSplitLine = (input: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let isEscaped = false

  for (const char of input) {
    if (isEscaped) {
      current += char
      isEscaped = false
    } else if (char === '\\' && inQuotes) {
      current += char
      isEscaped = true
    } else if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (char === '\n' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  if (inQuotes) {
    throw new Error('Unclosed quote in input string')
  }

  result.push(current)

  return result
}
