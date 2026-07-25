import keywordsDataRaw from './keywords.json';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const keywordsData = keywordsDataRaw as JsonDataWrapper<string>;
