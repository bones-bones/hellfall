export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  enumValues?: readonly string[];
};

export type FieldType = 'string' | 'textarea' | 'semicolon-list' | 'number' | 'boolean' | 'enum';


export type EditFormState = {
  root: Record<string, string>;
  faces: Record<string, string>[];
};