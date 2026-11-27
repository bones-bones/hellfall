import { canUseServerSearch } from './isServerSearchEnabled';

/**
 * Direct URL for the card catalog JSON ({ data: HCCard[] }).
 * Set CARD_CATALOG_URL in .env — browser fetch must go here directly (GCS/CDN).
 * When server search is on and CARD_CATALOG_URL is unset, returns '' so lazy tool
 * loads use `/api/cards/load` instead of the public GCS default.
 */
const DEFAULT_CATALOG_URL = 'https://storage.googleapis.com/hellscube-images/catalog.json';

export function getCardsCatalogUrl(): string {
  const explicit = process.env.CARD_CATALOG_URL?.trim();
  if (explicit) return explicit;
  if (canUseServerSearch()) return '';
  return DEFAULT_CATALOG_URL;
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
