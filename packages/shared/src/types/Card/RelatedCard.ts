import { HCObject } from '../Object';
import { SetCode } from '../Set';

export const relatedComponentList = [
  'draft_partner',
  'token',
  'token_maker',
  'meld_part',
  'meld_result',
  // 'combo_piece',
] as const;
/**
 * An option for the relationship between the related card and this card
 */
export type relatedComponent = (typeof relatedComponentList)[number];
/**
 * Checks if a value is a {@linkcode relatedComponent}
 * @param value the value to check
 */
export const isComponent = (value: any): value is relatedComponent =>
  relatedComponentList.includes(value as relatedComponent);
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
   * the old unique ID for this card in HC's database.
   */
  hcid: string;
  /**
   * The name of this particular related card.
   */
  name: string;
  /**
   * A string with the set for this card.
   */
  set: SetCode;
  /**
   * A string with the image for this card.
   */
  image?: string;
  /**
   * The type line of this card.
   */
  type_line: string;
  /**
   * A field explaining what role this card plays in this relationship.
   */
  component: relatedComponent;
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
  /**
   * Number of copies of this that are made by the other card (or x)
   */
  count?: string;
  /**
   * If the token should be persistent.
   */
  persistent?: boolean;
};
