import "server-only";

/**
 * Whether the site can take a card/UPI payment right now.
 *
 * Read by the catalogue so a "Buy now" button is only ever rendered when
 * pressing it can succeed. Without the keys, `paymentService.createOrder`
 * throws `CONFIG_ERROR`; the UI falls back to the enrolment form instead.
 */
export function isOnlineCheckoutEnabled(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
