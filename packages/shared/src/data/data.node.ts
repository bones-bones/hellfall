import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// import { loadHellscubeCatalogCards } from '../export/loadHellscubeCatalog';
import { HCCard, HCCardSymbol, HCSet } from '../types';
// import { error } from 'console';

export interface JsonDataWrapper<T> {
  data: T[];
}

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolveDataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) return fromEnv;
  return __dirname;
}

function loadJsonFileSync<T>(filename: string): JsonDataWrapper<T> {
  const filePath = join(resolveDataDir(), filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function getCardsLoadApiBase(): string | undefined {
  const base = process.env.CARDS_LOAD_API_URL?.trim();
  return base?.replace(/\/$/, '');
}

/** Load cards from bundled JSON, or via GET /api/cards/load when CARDS_LOAD_API_URL is set. */
export async function loadCardsData(): Promise<JsonDataWrapper<HCCard.Any>> {
  const apiBase = getCardsLoadApiBase();
  if (apiBase) {
    const res = await fetch(`${apiBase}/api/cards/load`);
    if (!res.ok) {
      throw new Error(`Failed to load cards from ${apiBase}/api/cards/load: ${res.status}`);
    }
    return (await res.json()) as JsonDataWrapper<HCCard.Any>;
  }
  return loadJsonFileSync<HCCard.Any>('Hellscube-Database.json');
}

export const cardsDataAsync = loadCardsData();
export const landsDataAsync = Promise.resolve(loadJsonFileSync<HCCard.Any>('lands.json'));
export const tokensDataAsync = Promise.resolve(loadJsonFileSync<HCCard.Any>('tokens.json'));
export const pipsDataAsync = Promise.resolve(loadJsonFileSync<HCCardSymbol>('pips.json'));
export const setsDataAsync = Promise.resolve(loadJsonFileSync<HCSet>('sets.json'));
export const creatorsDataAsync = Promise.resolve(loadJsonFileSync<string>('creators.json'));
export const oracleNamesAsync = Promise.resolve(loadJsonFileSync<string>('oracle-names.json'));
export const tagsDataAsync = Promise.resolve(loadJsonFileSync<string>('tags.json'));
export const typesDataAsync = Promise.resolve(loadJsonFileSync<string>('types.json'));

// Individual exports (bundled JSON at startup; live catalog via /api/cards/load)
export const cardsData = await cardsDataAsync;
export const landsData = loadJsonFileSync<HCCard.Any>('lands.json');
export const tokensData = loadJsonFileSync<HCCard.Any>('tokens.json');
export const pipsData = loadJsonFileSync<HCCardSymbol>('pips.json');
export const setsData = loadJsonFileSync<HCSet>('sets.json');
export const creatorsData = loadJsonFileSync<string>('creators.json');
export const oracleNames = loadJsonFileSync<string>('oracle-names.json');
export const tagsData = loadJsonFileSync<string>('tags.json');
export const typesData = loadJsonFileSync<string>('types.json');
