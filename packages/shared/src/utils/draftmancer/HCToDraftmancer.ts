import { HCCard, HCSet } from '@hellfall/shared/types';
import { AddCards, DraftEffect, DraftmancerCustomCard, SimpleDraftEffectList } from './draftTypes';
import {
  CardMap,
  compressHCCardFaces,
  getRelatedsFromCards,
  getRelatedsFromSet,
  hasTokenHCID,
  toFaces,
} from '../cardHandling';
import { HCCardToDraftmancerCard, StickerSheetScryfallIds } from './HCToDraftCard';
import { stripSingleSlashes } from '../textHandling';

export const HCToDraftmancer = (
  cardMap: CardMap,
  set?: HCSet,
  idList?: string[],
  draftMode?: 'commander' | 'jumpstart'
): { cards: DraftmancerCustomCard[]; tokens: DraftmancerCustomCard[] } => {
  const { cards: HCCards, tokens: HCTokens } =
    set && (cardMap.hasSet(set) || set == 'HC5')
      ? getRelatedsFromSet(set, cardMap, true)
      : idList?.length
      ? getRelatedsFromCards(idList, cardMap)
      : { cards: cardMap, tokens: new CardMap() };
  const draftCards = HCCards.map(card => compressHCCardFaces(card));
  const draftTokens = HCTokens.map(card => compressHCCardFaces(card));

  const getExportNameFromId = (id: string | undefined): string | undefined => {
    if (!id) return;
    const related = draftCards.get(id) ?? draftTokens.get(id);
    if (related) {
      return stripSingleSlashes(
        toFaces(related)[0].export_name ??
          (hasTokenHCID(related) ? related.id : toFaces(related)[0].name)
      );
    }
  };
  const getDraftEffects = (card: HCCard.Any): DraftEffect[] | undefined => {
    const effectList: DraftEffect[] = SimpleDraftEffectList.filter(effect =>
      card.tags?.includes(effect)
    );
    const draftpartnerNameList = [];
    if (card.all_parts) {
      card.all_parts
        .filter(part => part.is_draft_partner)
        .forEach(part => {
          const name = part.id ? getExportNameFromId(part.id) : part.name;
          if (name && part.count && parseInt(part.count) > 0) {
            draftpartnerNameList.push(...Array(parseInt(part.count)).fill(name));
          } else if (name) {
            draftpartnerNameList.push(name);
          }
        });
    }
    // handle \_\_\_\_\_\_\_ Balls
    if (card.hcid == '2136') {
      draftpartnerNameList.push(...StickerSheetScryfallIds);
    }
    if (draftpartnerNameList.length) {
      const add: AddCards = {
        type: 'AddCards',
        cards: draftpartnerNameList,
      };
      const count = card.tag_notes?.['AddCards'];
      if (count && parseInt(count) > 0) {
        add.count = parseInt(count);
      }
      effectList.push(add);
    }
    if (effectList.length) {
      return effectList;
    }
  };

  const getRelatedList = (card: HCCard.Any): string[] | undefined => {
    const relatedList = card.all_parts?.map(part => getExportNameFromId(part.id) ?? part.name);
    if (relatedList && relatedList.length) {
      return relatedList;
    }
  };

  const tokens = draftTokens.mapToArray(card => {
    const draftCard = HCCardToDraftmancerCard(card);
    const related = getRelatedList(card);
    if (related) {
      draftCard.related_cards = related;
    }
    const draft_effects = getDraftEffects(card);
    if (draft_effects) {
      draftCard.draft_effects = draft_effects;
    }
    return draftCard;
  });

  const cards = draftCards.mapToArray(card => {
    const draftCard = HCCardToDraftmancerCard(card);
    const related = getRelatedList(card);
    if (related) {
      draftCard.related_cards = related;
    }
    const draft_effects = getDraftEffects(card);
    if (draft_effects) {
      draftCard.draft_effects = draft_effects;
    }
    return draftCard;
  });

  return { cards, tokens };
};
