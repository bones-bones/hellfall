import { HCCard, HCLayout, HCRelatedCard } from '@hellfall/shared/types';
import { CardMap, toPasteableExportName } from '@hellfall/shared/utils';

const printCard = (name: string, count?: string, collector_number?: string) =>
  console.log(
    `${count ? `${count} ` : ''}${toPasteableExportName(
      `${name}${collector_number ? ` (HCJ) ${collector_number}` : ''}`
    )}`
  );

/**
 * Gets the actual name to use without all that extra face compression stuff.
 * @param card card to get the name for
 */

export const printHCJ = (card: HCCard.Any, relateds: CardMap) => {
  const getActualName = (part: HCRelatedCard): string => {
    const card = relateds.get(part.id);
    if (!card) return part.name;
    if (!('card_faces' in card) || card.layout == HCLayout.Cube) {
      return card.export_name ?? card.name;
    }
    if (card.card_faces[0].export_name) {
      return card.card_faces[0].export_name;
    }
    return card.card_faces.flatMap(face => (face.drop_face ? [] : face.name)).join(' // ');
  };

  console.log(card.name);
  card.all_parts?.forEach(part =>
    printCard(getActualName(part), part.count, part.collector_number)
  );
  console.log();
};
