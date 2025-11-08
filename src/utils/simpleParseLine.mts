export const simpleParseLine = (line: string): string[] =>
  line.split(' ').filter((e) => e !== '')
