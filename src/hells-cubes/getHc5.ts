import { HCCard } from '../api-types/Card/Card';
import { HCCardFace } from '../api-types/Card/CardFace';
import { HCObject } from '../api-types/Object';
import { HCLayout } from '../api-types/Card/values/Layout';
import { HCLegality } from '../api-types/Card/values/Legality';
import { HCColor } from '../api-types/Card/values/Color';
import type { HCColors } from '../api-types/Card/values/Color';
import { HCImageStatus } from '../api-types/Card/values/ImageStatus';

const PLACEHOLDER_CARD: Omit<HCCard.Normal, 'toFaces'> = {
  object: HCObject.ObjectType.Card,
  id: 'hc5-placeholder',
  layout: HCLayout.Normal,
  name: '◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎◻︎',
  image: 'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/G/l/i/iGlik/images.png',
  image_status: HCImageStatus.Placeholder,
  cmc: 0,
  creator: '◻︎◻︎◻︎◻︎',
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

function withToFaces<T extends HCCard.Any>(
  card: T
): T & { toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced] } {
  return {
    ...card,
    toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced] {
      return 'card_faces' in this ? this.card_faces : [this];
    },
  };
}

/** Attach toFaces() to a card-like object so it can be used wherever HCCard.Any is expected. */
export { withToFaces };

export function getHc5(): HCCard.Any[] {
  return Array.from({ length: 720 }, (_, i) =>
    withToFaces({
      ...PLACEHOLDER_CARD,
      id: `hc5-placeholder-${i}`,
    } as HCCard.Normal)
  );
}
