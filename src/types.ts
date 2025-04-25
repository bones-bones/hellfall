// The reason that there are 4 of Cost etc is because some cards have 4 sides. ooof

type SideArray<T> = [T | null, T | null, T | null, T | null];

export type HCEntry = {
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
  Tags?: string;
  Set: string; // "HLC",
  Rulings: string; //"See Magic Comprehensive Rules 894.1c Deez",
  CMC: number; //3,
  "Color(s)"?: string; // "Blue",
  Constructed?: ("Legal" | "Banned" | "Banned (4CB)" | "Banned (Commander)")[];

  Cost: SideArray<string>;
  "Supertype(s)"?: SideArray<string>;
  "Card Type(s)": SideArray<string>;
  "Subtype(s)"?: SideArray<string>;
  power?: [number | null | "", null, null, null];
  toughness?: [number | null, null, null, null];
  Loyalty: [any, null, "", ""];
  "Text Box"?: SideArray<string>;
  "Flavor Text"?: SideArray<string>;
  "small alt image": string;
  "Component of"?: string;
  FIELD44: string;
  FIELD45: string;
  FIELD46: string;
  FIELD47: string;
  FIELD48: string;
  FIELD49: string;
  FIELD50: string;
  FIELD51: string;
  FIELD52: string;
  FIELD53: string;
  FIELD54: string;
  FIELD55: string;
  FIELD56: string;
  tokens?: Token[];
};

export type Token = {
  Name: string;
  Image: string;
  Power: string;
  Toughness: string;
  Type: string;
  FIELD7: string;
};
