/**
 * Direct URL for the card catalog JSON ({ data: HCCard[] }).
 * Set CARD_CATALOG_URL in .env — browser fetch must go here directly (GCS/CDN).
 */
export function getCardsCatalogUrl(): string {
  return process.env.CARD_CATALOG_URL ?? '';
}
