export type PriceRange = { min: number; max: number };

type PricedVariation = {
  price?: number | string;
  enabled?: boolean;
};

type PricedProduct = {
  type?: string;
  price?: number | string;
  salePrice?: number | string;
  onSale?: boolean;
  variations?: PricedVariation[];
};

// For a variable product, the range spans its enabled variations' prices —
// the top-level product.price is just a fallback/parent value that isn't
// what's actually sold, so it's only used when there's nothing better.
export function getPriceRange(product: PricedProduct): PriceRange {
  if (product.type === 'variable' && Array.isArray(product.variations) && product.variations.length) {
    const prices = product.variations
      .filter(v => v.enabled !== false)
      .map(v => Number(v.price) || 0)
      .filter(p => p > 0);
    if (prices.length) {
      return { min: Math.min(...prices), max: Math.max(...prices) };
    }
  }
  const base = Number(product.onSale && product.salePrice ? product.salePrice : product.price) || 0;
  return { min: base, max: base };
}

export function formatPriceRange(range: PriceRange, formatPrice: (value: number) => string): string {
  return range.min === range.max ? formatPrice(range.min) : `${formatPrice(range.min)} – ${formatPrice(range.max)}`;
}
