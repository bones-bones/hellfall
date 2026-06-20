import tagsDataRaw from './tags.json';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const tagsData = tagsDataRaw as JsonDataWrapper<string>;
