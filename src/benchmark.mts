import fs from 'node:fs'
import { parse } from './parse.mjs'

const file = './test/example-full.beancount'
const fileBuffer = fs.readFileSync(file)
const fileText = fileBuffer.toString()

const fileSizeKB = fileBuffer.length / 1024

console.log(`File size: ${fileSizeKB.toFixed(2)} KB`)
console.log(`String length: ${fileText.length} characters`)
console.log('---')

const iterations = 10
const durations: number[] = []
let lastResult = parse(fileText)

console.log(`Running ${iterations} iterations...`)

for (let i = 0; i < iterations; i++) {
  const startTime = performance.now()
  lastResult = parse(fileText)
  const endTime = performance.now()
  durations.push(endTime - startTime)
}

const avgDuration = durations.reduce((a, b) => a + b, 0) / iterations
const avgDurationSeconds = avgDuration / 1000
const minDuration = Math.min(...durations)
const maxDuration = Math.max(...durations)

console.log(`Average parse time: ${avgDuration.toFixed(3)} ms`)
console.log(
  `Min: ${minDuration.toFixed(3)} ms, Max: ${maxDuration.toFixed(3)} ms`,
)
console.log(
  `Average throughput: ${(fileSizeKB / avgDurationSeconds / 1000).toFixed(2)} MB/s`,
)
console.log('---')
console.log(`Parsed ${lastResult.entries.length} items`)
