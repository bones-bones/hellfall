import { HCCard, HCCardSymbol } from '../types';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory (works with ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadJsonFile<T>(filename: string): T {
  const filePath = join(__dirname, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    throw error;
  }
}

export interface JsonDataWrapper<T> {
  data: T[];
}

export const cardsData = loadJsonFile<JsonDataWrapper<HCCard.Any[]>>('./Hellscube-Database.json');
export const landsData = loadJsonFile<JsonDataWrapper<HCCard.Any[]>>('./lands.json');
export const tokensData = loadJsonFile<JsonDataWrapper<HCCard.Any[]>>('./tokens.json');
export const pipsData = loadJsonFile<JsonDataWrapper<HCCardSymbol[]>>('./pips.json');
export const creators = loadJsonFile<JsonDataWrapper<string[]>>('./creators.json');
export const oracleNames = loadJsonFile<JsonDataWrapper<string[]>>('./oracle-names.json');
export const tagsData = loadJsonFile<JsonDataWrapper<string[]>>('./tags.json');
export const typesData = loadJsonFile<JsonDataWrapper<string[]>>('./types.json');
