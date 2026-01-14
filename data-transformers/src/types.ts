// The reason that there are 4 of Cost etc is because some cards have 4 sides. ooof

export type HCEntry = {
  Name: string; //"Whale Visions",
  Image: [
    string | null, // Here is the card as it was submitted
    string | null, // Here is the card to use in drafting _if_ the previous one isn't usable
    string | null, // Here is side 2
    string | null, // Side 3
    string | null // Side 4
  ]; //"https://cdn.discordapp.com/attachments/699985664992739409/699992833645346816/ri2sj4suvzb31.png",
  Creator: string;
  isActualToken?: boolean;
  Set: string; // "HLC",
  Rulings: string; //"See Magic Comprehensive Rules 894.1c Deez",
  CMC: number; //3,
  "Color(s)": string; // "Blue",
  Constructed?: ("Legal" | "Banned" | "Banned (4CB)" | "Banned (Commander)")[];
  Cost: [string, string, string, string];
  "Supertype(s)": [string, string, string, string];
  "Card Type(s)": [string, string, string, string];
  "Subtype(s)": [string, string, string, string];
  power: [number | null, null, null, null];
  toughness: [number | null, null, null, null];
  Loyalty: [any, null, "", ""];
  "Text Box": [string, string, string, string];
  "Flavor Text": [string, string, string, string];
  "small alt image": string;
  Tags?: string;
  CardId: string;
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

export type TokenForImport = Token & {
  "Related Cards (Read Comment)"?: string;
};
