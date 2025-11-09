/**
 * Formats a price string from amount and currency components.
 * Returns undefined if either amount or currency is missing.
 *
 * @param amount - The amount portion of the price
 * @param currency - The currency portion of the price
 * @returns Formatted price string "amount currency" or undefined
 */
export const formatPrice = (
  amount: string | undefined,
  currency: string | undefined,
  cost?: string,
  priceAmount?: string,
  priceCurrency?: string,
): string | undefined => {
  if (!amount || !currency) {
    return undefined
  }
  const result = [amount.trim() + ' ' + currency.trim()]
  if (cost) {
    result.push(`{${cost.trim()}}`)
  }
  if (priceAmount && priceCurrency) {
    result.push('@', formatPrice(priceAmount, priceCurrency)!)
  }

  return result.join(' ')
}
