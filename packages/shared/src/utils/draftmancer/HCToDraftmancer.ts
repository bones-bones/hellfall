import { HCCard } from '@hellfall/shared/types';
import { AddCards, DraftEffect, DraftmancerCustomCard, SimpleDraftEffectList } from './draftTypes';
import { compressHCCardFaces, getRelatedsFromCards, toFaces } from '../cardHandling';
import { getFilteredSet } from '@hellfall/shared/filters';
import { HCCardToDraftmancerCard, StickerSheetScryfallIds } from './HCToDraftCard';
import { stripSingleSlashes } from '../textHandling';

export const HCToDraftmancer = (
  cardList: HCCard.Any[],
  allCards: HCCard.Any[],
  draftMode?: 'commander' | 'jumpstart'
): { cards: DraftmancerCustomCard[]; tokens: DraftmancerCustomCard[] } => {
  const { cards: HCCards, tokens: HCTokens } = getRelatedsFromCards(cardList, allCards, true);
  const intcards =
    draftMode == 'jumpstart'
      ? getFilteredSet(allCards, 'FHCJ')
      : HCCards.map(card => compressHCCardFaces(card));
  const inttokens =
    draftMode == 'jumpstart'
      ? HCCards.map(card => compressHCCardFaces(card))
          .concat(HCTokens.map(token => compressHCCardFaces(token)))
          .filter(card => card.set != 'FHCJ')
      : HCTokens.map(token => compressHCCardFaces(token));

  const getExportNameFromId = (id: string): string | undefined => {
    const related = intcards.find(c => c.id == id) ?? inttokens.find(c => c.id == id);
    if (related) {
      return stripSingleSlashes(
        toFaces(related)[0].export_name ||
          (related.isActualToken ? related.id : toFaces(related)[0].name)
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
    if (card.id == '2136') {
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
    const relatedList = card.all_parts?.flatMap(part =>
      part.id ? getExportNameFromId(part.id) ?? [] : part.name
    );
    if (relatedList && relatedList.length) {
      return relatedList;
    }
  };

  const tokens = inttokens.map(card => {
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

  const cards = intcards.map(card => {
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
