import type { EntryType } from './parse.mjs'
import { parseMetadata, type Metadata } from './utils/parseMetadata.mjs'

export interface GenericParseResult {
  type: EntryType
  header: string
  props: {
    comment?: string
  }
}

export interface GenericParseResultWithDate extends GenericParseResult {
  props: GenericParseResult['props'] & {
    date: string
    metadata?: Metadata
  }
}

export interface GenericParseResultTransaction
  extends Omit<GenericParseResultWithDate, 'metadata'> {
  body: string[]
  flag?: string
  props: GenericParseResult['props'] & {
    date: string
    flag?: string
  }
}

export const genericParse = (
  unparsedEntry: string[],
):
  | GenericParseResult
  | GenericParseResultTransaction
  | GenericParseResultWithDate => {
  const [firstLine, ...rest] = unparsedEntry
  const splitFirstLine = firstLine.split(' ')
  if (/\d{4}-\d{2}-\d{2}/.exec(splitFirstLine[0])) {
    let type = splitFirstLine[1]

    let flag
    if (type.length === 1) {
      flag = type
      // flag!
      type = 'transaction'
    }

    // special case
    if (type === 'txn') {
      type = 'transaction'
    }

    if (type === 'transaction') {
      const date = splitFirstLine[0].trim()
      const [header, ...comment] = splitFirstLine.slice(2).join(' ').split(';')
      return {
        type,
        header: header.trim(),
        body: rest.map((r) => r.trim()),
        props: {
          date,
          flag,
          comment: comment.length > 0 ? comment.join(';').trim() : undefined,
        },
      } as GenericParseResultTransaction
    }

    const date = splitFirstLine[0].trim()
    const metadata = parseMetadata(rest)
    const [header, ...comment] = splitFirstLine.slice(2).join(' ').split(';')
    return {
      type,
      header: header.trim(),
      props: {
        date,
        metadata,
        comment: comment.length > 0 ? comment.join(';').trim() : undefined,
      },
    } as GenericParseResultWithDate
  }

  const [header, ...comment] = splitFirstLine.slice(1).join(' ').split(';')
  return {
    type: splitFirstLine[0].trim(),
    header: header.trim(),
    props: {
      metadata: parseMetadata(rest),

      comment: comment.length > 0 ? comment.join(';').trim() : undefined,
    },
  } as GenericParseResult
}
