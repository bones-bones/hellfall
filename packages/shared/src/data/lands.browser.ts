import landsDataRaw from './lands.json';
import { HCCard } from '../types';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const landsData = landsDataRaw as JsonDataWrapper<HCCard.Any>;
