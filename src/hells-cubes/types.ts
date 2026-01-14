export type DraftmancerCard = {
  id: string; //"Discount Sol Ring_custom_",
  oracle_id: string; // "Discount Sol Ring",
  name: string; // "Discount Sol Ring",
  mana_cost: string; //"{1}",
  colors: string[]; // [],
  set: string; //"custom",
  collector_number: string; //"",
  rarity: string; //"rare",
  type: string; //"Artifact",
  subtypes: string[];
  rating: number; //0,
  in_booster: boolean; // true,
  printed_names: {
    en: string; //"Discount Sol Ring"
  };
  image_uris: {
    en: string; //"https://lh3.googleusercontent.com/d/1PNd-reLsF8mypuQW9oiLu1N2GDuPCv7B"
  };
  is_custom: boolean; // true
  draft_effects?: (
    | string
    | {
        type: string;
        count?: number;
        cards?: string[];
        duplicateProtection?: boolean;
      }
  )[];
  related_cards?: string[];
};
