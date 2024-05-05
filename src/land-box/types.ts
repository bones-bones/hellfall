export type Land = {
  Type:
    | "Island"
    | "Wastes"
    | "Forest"
    | "Plains"
    | "Mountain"
    | "Swamp"
    | "Nebula";
  Creator: string;
  Url: string;
  Set: "HC4";
  Rarity: string;
};
