// The reason that there are 4 of Cost etc is because some cards have 4 sides. ooof

type SideArray<T> = [T | null, T | null, T | null, T | null];

// TODO: add color indicator property
export type HCEntry = {
  Id: string;
  Name: string; //"Whale Visions",
  Image: [
    string | null | undefined, // Here is the card as it was submitted
    string | null | undefined, // Here is the card to use in drafting _if_ the previous one isn't usable
    string | null | undefined, // Here is side 2
    string | null | undefined, // Side 3
    string | null | undefined // Side 4
  ];
  Creator: string;
  isActualToken?: boolean;
  Set: string; // "HLC",
  Constructed?: ('Legal' | 'Banned' | 'Banned (4CB)' | 'Banned (Commander)')[];
  'Component of'?: string;
  Rulings: string; //"See Magic Comprehensive Rules 894.1c Deez",
  CMC: number; //3,
  'Color(s)'?: string; // "Blue",
  Cost: SideArray<string>;
  'Supertype(s)'?: SideArray<string>;
  'Card Type(s)': SideArray<string>;
  'Subtype(s)'?: SideArray<string>;
  power?: [number | null | '', null, null, null];
  toughness?: [number | null, null, null, null];
  Loyalty: [any, null, '', ''];
  'Text Box'?: SideArray<string>;
  'Flavor Text'?: SideArray<string>;
  Tags?: string;
  "small alt image": string;
  tokens?: Token[];
};

export type Token = {
  Name: string;
  Image: string;
  Power: string;
  Toughness: string;
  Type: string;
};

export type Pip = {
  filename: string;
  name: string; // This is what is between the braces
  isMana: boolean;
  mv?: number | string; // make sure infinity works
  colors?: string[];
  // hybridColors:string[];
};
