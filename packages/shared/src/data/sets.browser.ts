import setsDataRaw from './sets.json';
import { HCSet } from '../types';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const setsData = setsDataRaw as JsonDataWrapper<HCSet>;
