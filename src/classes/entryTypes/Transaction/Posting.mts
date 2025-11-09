import { formatPrice } from '../../../utils/formatPrice.mjs'
import { FormatOptions } from '../../Entry.mjs'

export class Posting {
  flag?: string
  account!: string
  amount?: string
  currency?: string
  cost?: string
  priceCurrency?: string
  priceAmount?: string
  comment?: string

  constructor(obj: Record<string, unknown>) {
    Object.assign(this, obj)
  }

  static fromGenericParseResult(unparsedline: string) {
    // [Flag] Account Amount [{Cost}] [@ Price]
    const matches =
      /^(?:([^ ]) )?([^ ]*)(?: +([^A-Z]*) +(\w+)(?: +{(.*)})?(?: +@ +(?:(\d+\.?\d*) (\w+)))?)?( *;.*)?$/.exec(
        unparsedline,
      )
    if (!matches) {
      throw new Error('Could not parse posting')
    }
    const [
      ,
      flag,
      account,
      amount,
      currency,
      cost,
      priceAmount,
      priceCurrency,
      comment,
    ] = matches

    return new Posting({
      flag: flag,
      account: account?.trim(),
      amount: amount?.trim(),
      currency: currency?.trim(),
      cost: cost?.trim(),
      priceAmount: priceAmount?.trim(),
      priceCurrency: priceCurrency?.trim(),
      comment: comment?.replace(/^ *;/, '').trim(),
    })
  }

  get price(): string | undefined {
    return formatPrice(
      this.amount,
      this.currency,
      this.cost,
      this.priceAmount,
      this.priceCurrency,
    )
  }

  toString() {
    return this.toFormattedString({ currencyColumn: 0 })
  }

  toFormattedString(formatOptions: FormatOptions) {
    const parts: string[] = []
    if (this.flag !== undefined) {
      parts.push(this.flag)
    }
    parts.push(this.account)

    if (this.price !== undefined) {
      const paddingLength =
        formatOptions.currencyColumn -
        parts.join(' ').length -
        this.amount!.length -
        2 - // indent
        2 - // spacing
        2 // not sure what this is for

      if (paddingLength > 0) {
        parts.push(' '.repeat(paddingLength))
      }

      parts.push(this.price)
    }
    if (this.comment !== undefined) {
      parts.push(';', this.comment)
    }
    return parts.join(' ')
  }
}
