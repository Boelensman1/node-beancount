/**
 * Formats a price string from amount, currency, cost, and price annotation components.
 * Returns undefined if either amount or currency is missing.
 *
 * Format: "amount currency [{cost}] [@ priceAmount priceCurrency]"
 *
 * @param amount - The amount portion of the price
 * @param currency - The currency portion of the price
 * @param cost - Optional cost specification in curly braces
 * @param priceAmount - Optional price annotation amount
 * @param priceCurrency - Optional price annotation currency
 * @returns Formatted price string or undefined if amount/currency are missing
 */
export const formatPrice = (
  amount: string | undefined,
  currency: string | undefined,
  cost?: string,
  priceAmount?: string,
  priceCurrency?: string,
): string | undefined => {
  if (!amount) {
    return undefined
  }
  const result = [amount.trim() + (currency ? ' ' + currency.trim() : '')]
  if (cost) {
    result.push(`{${cost.trim()}}`)
  }
  if (priceAmount && priceCurrency) {
    result.push('@', formatPrice(priceAmount, priceCurrency)!)
  }

  return result.join(' ')
}
