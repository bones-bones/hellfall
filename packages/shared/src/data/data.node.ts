import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { HCCard, HCCardSymbol, HCSet } from '../types';

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

export const cardsDataAsync = Promise.resolve(
  loadJsonFileSync<HCCard.Any>('Hellscube-Database.json')
);
export const landsDataAsync = Promise.resolve(loadJsonFileSync<HCCard.Any>('lands.json'));
export const tokensDataAsync = Promise.resolve(loadJsonFileSync<HCCard.Any>('tokens.json'));
export const pipsDataAsync = Promise.resolve(loadJsonFileSync<HCCardSymbol>('pips.json'));
export const setsDataAsync = Promise.resolve(loadJsonFileSync<HCSet>('sets.json'));
export const creatorsDataAsync = Promise.resolve(loadJsonFileSync<string>('creators.json'));
export const oracleNamesAsync = Promise.resolve(loadJsonFileSync<string>('oracle-names.json'));
export const tagsDataAsync = Promise.resolve(loadJsonFileSync<string>('tags.json'));
export const typesDataAsync = Promise.resolve(loadJsonFileSync<string>('types.json'));

// Individual exports (synchronous, wrapped in Promise for API consistency)
export const cardsData = loadJsonFileSync<HCCard.Any>('Hellscube-Database.json');
export const landsData = loadJsonFileSync<HCCard.Any>('lands.json');
export const tokensData = loadJsonFileSync<HCCard.Any>('tokens.json');
export const pipsData = loadJsonFileSync<HCCardSymbol>('pips.json');
export const setsData = loadJsonFileSync<HCSet>('sets.json');
export const creatorsData = loadJsonFileSync<string>('creators.json');
export const oracleNames = loadJsonFileSync<string>('oracle-names.json');
export const tagsData = loadJsonFileSync<string>('tags.json');
export const typesData = loadJsonFileSync<string>('types.json');
