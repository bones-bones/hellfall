import pipsDataRaw from './pips.json';
import { HCCardSymbol } from '../types';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const pipsData = pipsDataRaw as JsonDataWrapper<HCCardSymbol>;
