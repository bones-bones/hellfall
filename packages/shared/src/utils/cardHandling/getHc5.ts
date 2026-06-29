import {
  HCCard,
  HCObject,
  HCLayout,
  HCLegality,
  HCImageStatus,
  HCBorderColor,
  HCFinish,
  HCFrame,
  HCKind,
} from '@hellfall/shared/types';
import { addToJSONToCard, CardMap } from '@hellfall/shared/utils';

const PLACEHOLDER_CARD: HCCard.Normal = {
  object: HCObject.ObjectType.Card,
  id: '55555555-5555-4555-a555-555555555555',
  oracle_id: '55555555-5555-4555-a555-555555555555',
  collector_number: '555',
  hcid: 'hc5-placeholder',
  kind: HCKind.Card,
  layout: HCLayout.Normal,
  name: '◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎',
  image: 'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/G/l/i/iGlik/images.png',
  image_status: HCImageStatus.Placeholder,
  mana_value: 0,
  creators: ['◻︎◻︎◻︎◻︎'],
  set: 'HC5',
  rulings: '',
  type_line: 'Card',
  oracle_text: '',
  mana_cost: '',
  color_identity: [],
  colors: [],
  keywords: [],
  legalities: {
    standard: HCLegality.Legal,
    '4cb': HCLegality.Legal,
    commander: HCLegality.Legal,
  },
  color_identity_hybrid: [],
  border_color: HCBorderColor.Black,
  finish: HCFinish.Nonfoil,
  frame: HCFrame.Stamp,
};

// function withCardMethods<T extends HCCard.Any>(
//   card: T
// ): T & {
//   toJSON(): Record<string, any>;
// } {
//   return {
//     ...card,
//     toJSON(): Record<string, any> {
//       return this as Record<string, any>;
//     },
//   };
// }

/** Attach toFaces() to a card-like object so it can be used wherever HCCard.Any is expected. */
// export { withCardMethods };

// export const withToJSON = <T extends HCCard.Any>(card: T) => withCardMethods(card);

export const getHc5 = (): CardMap =>
  new CardMap(
    Array.from({ length: 720 }, (_, i) =>
      addToJSONToCard({
        ...PLACEHOLDER_CARD,
        id: `55555555-5555-4${i.toString().padStart(3, '0')}-a555-555555555555`,
        oracle_id: '55555555-5555-4555-a555-555555555555',
        hcid: `hc5-placeholder-${i}`,
        name: `◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎ ${i}`,
      })
    )
  );
