/** @param {{price_toman:number,quantity:number}[]} items */
/** Calculate Toman subtotal from cart line items. */
export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + Number(item.price_toman) * Number(item.quantity), 0);
}
/** @param {number} quantity */
/** A valid cart quantity is a whole number between one and 99. */
export function isValidQuantity(quantity) {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 99;
}
/** @param {number} original @param {number} sale */
/** Return a discount percentage only when the original price is greater than the sale price. */
export function discountPercent(original, sale) {
  if (!Number.isFinite(original) || !Number.isFinite(sale) || original <= sale || sale < 0) return 0;
  return Math.round((1 - sale / original) * 100);
}
