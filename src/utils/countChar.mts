export const countChar = (line: string, charToCount: string) => {
  let count = 0
  for (const char of line) {
    if (char === charToCount) count++
  }
  return count
}
