import oracleNamesRaw from './oracle-names.json';
import type { JsonDataWrapper } from './jsonDataWrapper';

export const oracleNames = oracleNamesRaw as JsonDataWrapper<string>;
