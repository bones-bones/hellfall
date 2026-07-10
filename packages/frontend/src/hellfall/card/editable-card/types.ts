import { HCCard } from '@hellfall/shared/types';

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  enumValues?: readonly string[];
  explanation?: string;
  readOnly?: boolean;
  required?: boolean;
  shouldHide?: (card: HCCard.Any, faceIndex: number, faceFields: Record<string, string>) => boolean;
};

export type FieldSection = {
  section: string;
};

export type FieldConfigEntry = FieldConfig | FieldSection;

export function isFieldConfig(entry: FieldConfigEntry): entry is FieldConfig {
  return 'key' in entry;
}

export function getFieldConfigs(entries: readonly FieldConfigEntry[]): FieldConfig[] {
  return entries.filter(isFieldConfig);
}

export type FieldConfigGroup = {
  label?: string;
  fields: FieldConfig[];
};

export function groupFieldConfigs(entries: readonly FieldConfigEntry[]): FieldConfigGroup[] {
  const groups: FieldConfigGroup[] = [];
  let current: FieldConfigGroup = { fields: [] };

  for (const entry of entries) {
    if (isFieldConfig(entry)) {
      current.fields.push(entry);
    } else {
      if (current.fields.length > 0) {
        groups.push(current);
      }
      current = { label: entry.section, fields: [] };
    }
  }
  if (current.fields.length > 0) {
    groups.push(current);
  }
  return groups;
}

export type FieldType = 'string' | 'textarea' | 'semicolon-list' | 'number' | 'boolean' | 'enum';

export type EditFormState = {
  root: Record<string, string>;
  faces: Record<string, string>[];
};
