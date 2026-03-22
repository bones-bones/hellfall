import { HCObject } from '../Object';

/**
 * A related card entry.
 */
export type HCRelatedCard = HCObject.Object<HCObject.ObjectType.RelatedCard> & {
  /**
   * An unique ID for this card in HC's database.
   *
   * @type UUID
   */
  id: string;
  /**
   * A field explaining what role this card plays in this relationship.
   */
  component:
    | 'token'
    | 'token_maker'
    | 'meld_part'
    | 'meld_result'
    | 'combo_piece'
    | 'draft_partner';
  /**
   * The name of this particular related card.
   */
  name: string;
  /**
   * The type line of this card.
   */
  type_line: string;
  /**
   * A string with the set for this card.
   */
  set: string;
  /**
   * A string with the image for this card.
   */
  image?: string;
  /**
   * A URI where you can retrieve a full object describing this card on HC's API.
   *
   * @type URI
   */
  // uri: string;
  /**
   * Whether this card is draftpartners with the other card
   */
  is_draft_partner?: boolean;
};
