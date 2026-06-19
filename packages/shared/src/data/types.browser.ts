import typesDataRaw from './types.json';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const typesData = typesDataRaw as JsonDataWrapper<string>;
