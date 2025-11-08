export const stringAwareParseLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (char === ' ' && !inQuotes) {
      if (current !== '') {
        result.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }

  if (current !== '') {
    result.push(current)
  }

  return result
}
