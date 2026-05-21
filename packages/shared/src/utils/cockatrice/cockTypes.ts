import { HCColors } from '@hellfall/shared/types';

export type CockFaceProps = Record<string, string | number | HCColors> & {
  name: string;
  text: string;
  layout: string;
  type: string;
  maintype: string;
  manacost: string;
  cmc: number;
  colors?: string[];
  pt?: string;
  loyalty?: string;
  picurl?: string;
};
export type CockCardProps = Record<string, string | CockFaceProps[]> & {
  coloridentity?: string;
  id: string;
  'format-standard'?: 'legal';
  'format-4cb'?: 'legal';
  'format-commander'?: 'legal';
  props: CockFaceProps[];
  related?: CockRelatedProps[];
  token?: '1';
  set: string;
  collector_number?: string;
};
export type CockRelatedProps = Record<string, string> & {
  id: string;
  name?: string;
  reverse: 'reverse-' | '';
  count?: string;
  attach?: 'transform';
  persistent?: 'persistent';
};
