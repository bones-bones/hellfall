/**
 * Direct URL for the card catalog JSON ({ data: HCCard[] }).
 * Set CARD_CATALOG_URL in .env — browser fetch must go here directly (GCS/CDN).
 */
export function getCardsCatalogUrl(): string {
  return process.env.CARD_CATALOG_URL ?? '';
}

/** Public GCS manifest next to catalog.json (`{ version, cardCount }`). */
export function getCatalogManifestUrl(): string {
  const catalog = getCardsCatalogUrl().replace(/\/$/, '');
  if (!catalog) return '';
  if (catalog.endsWith('/catalog.json')) {
    return `${catalog.slice(0, -'/catalog.json'.length)}/catalog-manifest.json`;
  }
  if (catalog.endsWith('catalog.json')) {
    return catalog.replace(/catalog\.json$/, 'catalog-manifest.json');
  }
  return '';
}
