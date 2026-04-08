import { HCCard } from '@hellfall/shared/types/Card/Card';
import { HCCardFace } from '@hellfall/shared/types/Card/CardFace';
import { HCObject } from '@hellfall/shared/types/Object';
import { HCLayout } from '@hellfall/shared/types/Card/values/Layout';
import { HCLegality } from '@hellfall/shared/types/Card/values/Legality';
import { HCColor } from '@hellfall/shared/types/Card/values/Color';
import type { HCColors } from '@hellfall/shared/types/Card/values/Color';
import { HCImageStatus } from '@hellfall/shared/types/Card/values/ImageStatus';

const PLACEHOLDER_CARD: Omit<HCCard.Normal, 'toFaces' | 'toJSON'> = {
  object: HCObject.ObjectType.Card,
  id: 'hc5-placeholder',
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
  color_identity: [HCColor.Colorless],
  colors: [HCColor.Colorless] as HCColors,
  keywords: [],
  legalities: {
    standard: HCLegality.Legal,
    '4cb': HCLegality.Legal,
    commander: HCLegality.Legal,
  },
  color_identity_hybrid: [],
  draft_image_status: HCImageStatus.Inapplicable,
  variation: false,
};

function withCardMethods<T extends HCCard.Any>(
  card: T
): T & {
  toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced];
  toJSON(): Record<string, any>;
} {
  return {
    ...card,
    toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced] {
      return 'card_faces' in this ? this.card_faces : [this];
    },
    toJSON(): Record<string, any> {
      return this as Record<string, any>;
    },
  };
}

/** Attach toFaces() to a card-like object so it can be used wherever HCCard.Any is expected. */
export { withCardMethods };

export const withToFaces = <T extends HCCard.Any>(card: T) => withCardMethods(card);
export const withToJSON = <T extends HCCard.Any>(card: T) => withCardMethods(card);

export function getHc5(): HCCard.Any[] {
  return Array.from({ length: 720 }, (_, i) =>
    withCardMethods({
      ...PLACEHOLDER_CARD,
      id: `hc5-placeholder-${i}`,
      name: `◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎ ${i}`,
    } as HCCard.Normal)
  );
}
