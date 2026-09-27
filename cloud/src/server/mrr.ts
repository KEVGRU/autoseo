/**
 * Monthly recurring revenue of a Stripe subscription (pure, unit tested). Stored per instance on every subscription
 * sync so the growth report can sum real amounts (monthly and yearly plans, discounts) without calling Stripe.
 */
import type Stripe from "stripe";

/** Months per billing interval unit. */
const MONTHS: Record<string, number> = { day: 12 / 365, week: 12 / 52, month: 1, year: 12 };

type InvoiceAmounts = Pick<Stripe.Invoice, "total_excluding_tax" | "subtotal" | "total_discount_amounts">;
type SubscriptionItems = {
  items: { data: { quantity?: number; price: Pick<Stripe.Price, "unit_amount" | "recurring"> }[] };
};

/** Net amount of an invoice in cents: excluding tax, after discounts. */
export function invoiceNetCents(invoice: InvoiceAmounts): number {
  if (typeof invoice.total_excluding_tax === "number") return invoice.total_excluding_tax;
  const discounts = (invoice.total_discount_amounts ?? []).reduce((sum, d) => sum + d.amount, 0);
  return Math.max(0, invoice.subtotal - discounts);
}

/**
 * Billing interval and MRR (cents) of a subscription: its latest invoice's net amount spread over the months of the
 * billing interval (a yearly plan counts 1/12 per month; a trial or $0 invoice gives 0). Without an invoice: the
 * prices × quantities. `planInterval` is the price's interval ("month" / "year"), null without a recurring price.
 */
export function subscriptionMrr(sub: SubscriptionItems, invoice: InvoiceAmounts | null): { planInterval: string | null; mrrCents: number | null } {
  const recurring = sub.items.data.find((item) => item.price.recurring)?.price.recurring;
  if (!recurring) return { planInterval: null, mrrCents: null };
  const months = (MONTHS[recurring.interval] ?? 1) * (recurring.interval_count || 1);
  const amount = invoice
    ? invoiceNetCents(invoice)
    : sub.items.data.reduce((sum, item) => sum + (item.price.unit_amount ?? 0) * (item.quantity ?? 1), 0);
  return { planInterval: recurring.interval, mrrCents: Math.round(amount / months) };
}
