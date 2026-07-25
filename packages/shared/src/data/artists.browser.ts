import artistsDataRaw from './artists.json';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const artistsData = artistsDataRaw as JsonDataWrapper<string>;
