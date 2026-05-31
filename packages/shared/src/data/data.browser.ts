import cardsDataRaw from './Hellscube-Database.json';
import landsDataRaw from './lands.json';
import tokensDataRaw from './tokens.json';
import pipsDataRaw from './pips.json';
import creatorsDataRaw from './creators.json';
import oracleNamesRaw from './oracle-names.json';
import tagsDataRaw from './tags.json';
import typesDataRaw from './types.json';
import { HCCard, HCCardSymbol } from '../types';

export interface JsonDataWrapper<T> {
  data: T[];
}


// Export the data directly (synchronous, no Node.js code!)
export const cardsData = cardsDataRaw as JsonDataWrapper<HCCard.Any>;
export const landsData = landsDataRaw as JsonDataWrapper<HCCard.Any>;
export const tokensData = tokensDataRaw as JsonDataWrapper<HCCard.Any>;
export const pipsData = pipsDataRaw as JsonDataWrapper<HCCardSymbol>;
export const creatorsData = creatorsDataRaw as JsonDataWrapper<string>;
export const oracleNames = oracleNamesRaw as JsonDataWrapper<string>;
export const tagsData = tagsDataRaw as JsonDataWrapper<string>;
export const typesData = typesDataRaw as JsonDataWrapper<string>;