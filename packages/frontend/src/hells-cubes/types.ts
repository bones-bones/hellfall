import { HCColors, HCLayout } from '@hellfall/shared/types';

// see https://draftmancer.com/cubeformat.html for more details
export type DraftmancerCardFace = {
  name: string;
  image?: string;
  type: string;
  subtypes?: Array<string>;
  mana_cost?: string; // Mana cost.
  oracle_text?: string; // Oracle text.
  power?: number | string; // Creature power.
  toughness?: number | string; // Creature toughness.
  loyalty?: number | string; // Planeswalker loyalty.
  // layout?: string; // Possible values are: 'split' and 'split-left'. 'flip' is not supported for card backs.
};

export const SimpleDraftEffectList = [
  'FaceUp',
  'Reveal',
  'NotePassingPlayer',
  'NoteDraftedCards',
  'ChooseColors',
  'AetherSearcher',
  'CanalDredger',
  'ArchdemonOfPaliano',
  'LoreSeeker',
  'RemoveDraftCard',
  'CogworkLibrarian',
  'AgentOfAcquisitions',
  'LeovoldsOperative',
  'NoteCardName',
  'NoteCreatureName',
  'NoteCreatureTypes',
  'TrackRemovedCardsNames',
  'TrackRemovedCardsSubtypes',
  'CogworkGrinder',
];

export type AddCards = {
  type: 'AddCards';
  count?: number;
  cards: string[];
  duplicateProtection?: boolean;
};

export type DraftEffect = (typeof SimpleDraftEffectList)[number] | AddCards;

// export const HCLayoutToDraftLayout:Record<string,'split'|'split-left'|'flip'>= {
// }

export type DraftmancerCustomCard = {
  name: string;
  mana_cost: string;
  type: string;
  image?: string;
  colors?: HCColors;
  set?: string;
  // collector_number?: string;
  // rarity?: string;
  subtypes?: Array<string>;
  rating?: number; // A rating of the strength of the card in a vacuum, between 0 and 5. This may help bots navigate drafts when they don't know any cards :^)
  // layout?: string; // Possible values are: 'split', 'flip' and 'split-left'
  back?: DraftmancerCardFace;
  related_cards?: Array<string | DraftmancerCardFace>; // You can use this field to display some related cards when right clicking on the card. CardID can be the name of another custom card, or a Scryfall ID.
  draft_effects?: Array<DraftEffect>; // See the list of valid effects bellow.
  // foil?: boolean; // Override the default finish of the card
  oracle_text?: string; // Oracle text.
  power?: number | string; // Creature power
  toughness?: number | string; // Creature toughness
  loyalty?: number | string; // Planeswalker loyalty/battle defense
  canBeACommander?: boolean;
};
