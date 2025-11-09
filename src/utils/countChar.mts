export const countChar = (line: string, charToCount: string) => {
  return line.split(charToCount).length - 1
}
