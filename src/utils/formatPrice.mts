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
): string | undefined => {
  return amount && currency ? amount.trim() + ' ' + currency.trim() : undefined
}
