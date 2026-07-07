import { HCCard } from '@hellfall/shared/types';

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  enumValues?: readonly string[];
  explanation?: string;
  shouldHide?: (card: HCCard.Any, faceIndex: number, faceFields: Record<string, string>) => boolean;
};

export type FieldType = 'string' | 'textarea' | 'semicolon-list' | 'number' | 'boolean' | 'enum';

export type EditFormState = {
  root: Record<string, string>;
  faces: Record<string, string>[];
};
