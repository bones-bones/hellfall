// see https://draftmancer.com/cubeformat.html for more details
export type DraftmancerCardFace = {
  /**
   * The name of the face
   */
  name: string;
  /**
   * The image url
   */
  image?: string;
  /**
   * The mana cost. Can't include symbols that aren't normal magic ones
   */
  mana_cost?: string;
  /**
   * The type line
   */
  type: string;
  /**
   * The oracle text
   */
  oracle_text?: string;
  /**
   * The power
   */
  power?: number | string;
  /**
   * The toughness
   */
  toughness?: number | string;
  /**
   * The loyalty/defense
   */
  loyalty?: number | string;
  /**
   * Possible values are: 'split' and 'split-left'. 'flip' is not supported for card backs.
   */
  layout?: string;
};

export const SimpleDraftEffectList = [
  // On pick effects:
  'FaceUp', // Reveal the card to other players and mark the card as face up.
  // Important note: FaceUp is necessary for most 'UsableEffects" to function correctly!.
  'Reveal', // Reveal the card to other players
  'NotePassingPlayer', // Note the previous player's name on the card.
  'NoteDraftedCards', // Note the number of cards drafted this round, including this card.
  'ChooseColors', // Note colors chosen by your neighbors and you.
  'AetherSearcher', // Reveal and note the next drafted card.
  'CanalDredger', // The last card of each booster is passed to you.
  'ArchdemonOfPaliano', // Pick the next 3 cards randomly.
  // Optional on pick effects:
  'LoreSeeker', // Lore Seeker effect: "You may add a booster pack to the draft".
  // Usable effects (when the card is already in the player's pool):
  'RemoveDraftCard', //  Remove the picked card(s) from the draft and associate them with the card.
  'CogworkLibrarian', // Replace this card in a pack for an additional pick.
  'AgentOfAcquisitions', // Pick the whole booster, skip until next round.
  'LeovoldsOperative', // Pick an additional card, skip the next booster.
  'NoteCardName', // Note the picked card's name on the card.
  'NoteCreatureName', // Note the picked creature's name on the card.
  'NoteCreatureTypes', // Note the picked creature's types on the card.
  // Other:
  'TrackRemovedCardsNames', // Will display the names of cards removed by the 'RemoveDraftCard' effect.
  'TrackRemovedCardsSubtypes', // Will display the unique subtypes of cards removed by the 'RemoveDraftCard' effect.
  'CogworkGrinder', // Will display the number of cards removed by the 'RemoveDraftCard' effect.
  // Custom:
  'BurnAfterPicking', // The card is not added to the player's pool.
  // Useful if you're only interrested in their other draft effects.
];

// TODO: support AddBooster, if necessary
/**
 * Adds additional cards to your draft pool.
 */
export type AddCards = {
  type: 'AddCards';
  /**
   * Optional, if omitted, all cards from the following array will be added.
   * Otherwise, 'count' random cards will be added to your pool.
   */
  count?: number;
  /**
   * The cards to add
   */
  cards: string[];
  /**
   * Optional, defaults to true.
   * Duplicates of the same card can be used to increase its probability of being picked.
   */
  duplicateProtection?: boolean;
};

export type DraftEffect = (typeof SimpleDraftEffectList)[number] | AddCards;

// export const HCLayoutToDraftLayout:Record<string,'split'|'split-left'|'flip'>= {
// }

export type DraftmancerCustomCard = {
  /**
   * The id of the card
   */
  id: string;
  /**
   * The name of the card
   */
  name: string;
  /**
   * The image url
   */
  image?: string;
  /**
   * The mana cost. Can't include symbols that aren't normal magic ones
   */
  mana_cost: string;
  /**
   * The type line
   */
  type: string;
  /**
   * The oracle text
   */
  oracle_text?: string;
  /**
   * The power
   */
  power?: number | string;
  /**
   * The toughness
   */
  toughness?: number | string;
  /**
   * The loyalty/defense
   */
  loyalty?: number | string;
  /**
   * Possible values are: 'split', 'flip' and 'split-left'
   */
  layout?: string;
  /**
   * The card colors. Can't include colors that aren't normal magic ones
   */
  colors?: string[];
  /**
   * The card set
   */
  set?: string;
  /**
   * The collector number
   */
  collector_number?: string;
  /**
   * The card back
   */
  back?: DraftmancerCardFace;
  /**
   * You can use this field to display some related cards when right clicking on the card.
   * CardID can be the name of another custom card, or a Scryfall ID.
   */
  related_cards?: Array<string | DraftmancerCardFace>;
  /**
   * The draft effects. See {@linkcode SimpleDraftEffectList} and {@linkcode AddCards}
   */
  draft_effects?: Array<DraftEffect>;
  /**
   * A flag for internal use that helps the exporter handle commander drafts
   */
  canBeACommander?: boolean;
  // rarity?: string;
  // rating?: number; // A rating of the strength of the card in a vacuum, between 0 and 5. This may help bots navigate drafts when they don't know any cards :^)
  // foil?: boolean; // Override the default finish of the card
};
