export function generateUpiPaymentUrl(
  upiVpa: string,
  payeeName: string,
  amount: number,
  invoiceNumber: string,
  currencyCode: string = 'INR'
): string {
  const cleanVpa = encodeURIComponent(upiVpa.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(`Invoice ${invoiceNumber}`);
  const cleanAmount = amount.toFixed(2);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${cleanAmount}&cu=${currencyCode}&tn=${cleanNote}`;
}

export function getQrCodeImageUrl(data: string, size: number = 180): string {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=4`;
}
