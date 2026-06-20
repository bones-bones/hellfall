import creatorsDataRaw from './creators.json';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const creatorsData = creatorsDataRaw as JsonDataWrapper<string>;
