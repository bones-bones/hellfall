import { isInteger } from '@hellfall/shared/utils';
import { HCObject } from '../Object';
import { isSetCode, SetCode } from '../Set';
import { getPartEntries, partPropType } from './Props';

export const relatedComponentList = [
  'draft_partner',
  'token',
  'token_maker',
  'meld_part',
  'meld_result',
  // 'combo_piece',
] as const;
export type relatedComponent = (typeof relatedComponentList)[number];
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

export const isRelatedCard = (value: any): value is HCRelatedCard => {
  if (typeof value != 'object') return false;
  const face = value as HCRelatedCard;
  if (
    !getPartEntries(face).every(([prop, value]) => {
      switch (prop) {
        case 'object':
          return value == HCObject.ObjectType.RelatedCard;
        case 'set':
          return isSetCode(value) || value === '';
        case 'image':
          return typeof value == 'string' && value.startsWith('https://');
        case 'component':
          return isComponent(value);
        case 'is_draft_partner':
        case 'persistent':
          return value === true;
        case 'count':
          return typeof value == 'string' && (isInteger(value) || value == 'x');
      }
      return ['id', 'hcid', 'name', 'type_line'].includes(prop) && typeof prop == 'string';
    })
  ) {
    return false;
  }
  return ['object', 'id', 'hcid', 'name', 'set', 'type_line', 'component', 'colors'].every(
    prop => face[prop as partPropType] != undefined
  );
};
