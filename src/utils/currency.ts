export function formatCurrency(
  amount: number = 0,
  currencySymbol: string = '$',
  currencyPosition: 'BEFORE' | 'AFTER' = 'BEFORE',
  decimalPlaces: number = 2
): string {
  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  if (currencyPosition === 'AFTER') {
    return `${formattedNumber} ${currencySymbol}`;
  }
  return `${currencySymbol}${formattedNumber}`;
}
