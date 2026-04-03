export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100);
}

export function formatPriceInput(priceCents: number): string {
  const amount = (priceCents / 100).toFixed(2);
  return amount.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function parseEuroInput(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return 0;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}
