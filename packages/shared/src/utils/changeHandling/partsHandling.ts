import { HCCard, HCObject, HCRelatedCard, relatedComponent } from '@hellfall/shared/types';
import { textEquals } from '../textHandling';
import { pushProp } from '../listHandling';
import { CardMap, toFaces } from '../cardHandling';

/**
 * Checks whether a card has any related card with a given component
 * @param card card to check
 * @param comp component to check for
 */
export const hasPartWithComp = (card: HCCard.Any, comp: relatedComponent): boolean =>
  card.all_parts?.some(part => part.component == comp) ?? false;

/**
 * Updates a card and its related cards
 * @param card card to update
 * @param relateds `CardMap` containing the card's related cards
 */
export const updateParts = (
  card: HCCard.Any,
  relateds: CardMap
) /* :{card:HCCard.Any;relateds:HCCard.Any[]} */ => {
  if (!card.all_parts) {
    return;
  }
  if (card.layout == 'front') {
    const headliners: HCRelatedCard[] = [];
    const others: HCRelatedCard[] = [];
    const nonbasics: HCRelatedCard[] = [];
    const thriving: HCRelatedCard[] = [];
    const basics: HCRelatedCard[] = [];
    relateds.forEach(relatedCard => {
      const cardAsRelated: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: card.id,
        hcid: card.hcid,
        name: card.name,
        set: card.set,
        image: card.image,
        type_line: card.type_line,
        component: 'draft_partner',
      };
      const frontIndex = card.all_parts?.findIndex(e => e.hcid == relatedCard.hcid);
      const alreadyHasPart = frontIndex != -1 && frontIndex != undefined;
      const part: HCRelatedCard = alreadyHasPart
        ? card.all_parts![frontIndex]
        : {
            object: HCObject.ObjectType.RelatedCard,
            id: relatedCard.id,
            hcid: relatedCard.hcid,
            name: relatedCard.name,
            set: relatedCard.set,
            image: relatedCard.image,
            type_line: relatedCard.type_line,
            component: 'draft_partner',
            is_draft_partner: true,
          };
      if (part.count) {
        cardAsRelated.count = part.count;
      }
      if (alreadyHasPart) {
        part.id = relatedCard.id;
        part.hcid = relatedCard.hcid;
        part.name = relatedCard.name;
        part.set = relatedCard.set;
        part.image = relatedCard.image;
        part.type_line = relatedCard.type_line;
      }
      const relatedIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
      if (relatedIndex == -1 || relatedIndex == undefined || !card.all_parts) {
        pushProp(relatedCard, 'all_parts', cardAsRelated);
      } else {
        relatedCard.all_parts![relatedIndex] = cardAsRelated;
      }
      if (relatedCard.tags?.includes('headliner')) {
        headliners.push(part);
      } else if (
        relatedCard.name.startsWith('Thriving') &&
        !relatedCard.name.startsWith('Thriving Puff')
      ) {
        thriving.push(part);
      } else if (toFaces(relatedCard)[0].supertypes?.includes('Basic')) {
        basics.push(part);
      } else if (toFaces(relatedCard)[0].types?.includes('Land')) {
        nonbasics.push(part);
      } else {
        others.push(part);
      }
    });
    card.all_parts
      ?.filter(part => !part.id)
      .forEach(part => {
        if (part.name.startsWith('Thriving')) {
          thriving.push(part);
        } else {
          basics.push(part);
        }
      });
    card.all_parts = [...headliners, ...others, ...nonbasics, ...thriving, ...basics];
    return;
  }
  card.all_parts
    .filter(e => e.component == 'token_maker')
    .forEach(part => {
      const cardAsRelated: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: card.id,
        hcid: card.hcid,
        name: card.name,
        set: card.set,
        image: card.image,
        type_line: card.type_line,
        component: 'token',
      };
      if (part.count) {
        cardAsRelated.count = part.count;
      }
      const relatedCard =
        relateds.get(part.id) ??
        relateds.find(related => textEquals(part.hcid, related.hcid)) ??
        relateds.find(related => textEquals(part.name, related.name));
      if (!relatedCard) {
        const partIndex = card.all_parts!.indexOf(part);
        if (partIndex !== -1) {
          card.all_parts!.splice(partIndex, 1);
        }
        return;
      }
      part.id = relatedCard.id;
      part.hcid = relatedCard.hcid;
      part.name = relatedCard.name;
      part.set = relatedCard.set;
      part.image = relatedCard.image;
      part.type_line = relatedCard.type_line;
      if (relatedCard.tags?.includes('persistent-tokens')) {
        part.persistent = true;
        cardAsRelated.persistent = true;
      }
      // update relatedCard.all_parts

      const relatedIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
      if (relatedIndex == -1 || relatedIndex == undefined || !relatedCard.all_parts) {
        pushProp(relatedCard, 'all_parts', cardAsRelated);
      } else {
        relatedCard.all_parts[relatedIndex] = cardAsRelated;
      }
      // if stickers or AddCards, add draftpartner props
      if (
        (card.type_line.includes('Stickers') && relatedCard.tags?.includes('draftpartner')) ||
        (relatedCard.tags?.includes('AddCards') &&
          card.hcid != 'Ticket Counter1' &&
          (!relatedCard.tag_notes?.['AddCards'] ||
            parseInt(relatedCard.tag_notes['AddCards']) ||
            relatedCard.tag_notes['AddCards'] == card.hcid))
      ) {
        relatedCard.has_draft_partners = true;
        card.has_draft_partners = true;
        card.not_directly_draftable = true;
        part.is_draft_partner = true;
        relatedCard.all_parts!.find(e => e.id == card.id)!.is_draft_partner = true;
      }
    });
  card.all_parts
    .filter(e => e.component == 'draft_partner' && e.set != 'FHCJ')
    .forEach(part => {
      const cardAsRelated: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: card.id,
        hcid: card.hcid,
        name: card.name,
        set: card.set,
        image: card.image,
        type_line: card.type_line,
        component: 'draft_partner',
        is_draft_partner: true,
      };
      if (part.count) {
        cardAsRelated.count = part.count;
      }
      const relatedCard =
        relateds.get(part.id) ??
        relateds.find(related => textEquals(part.hcid, related.hcid)) ??
        relateds.find(related => textEquals(part.name, related.name));
      if (!relatedCard) {
        throw new Error(
          `updateParts: draft_partner part not found for card "${card.name}" ` +
            `(${card.hcid}): part id=${part.id}, hcid=${part.hcid}, name=${part.name}`
        );
      }
      if (!relatedCard.has_draft_partners) {
        relatedCard.has_draft_partners = true;
      }
      if (!card.has_draft_partners) {
        card.has_draft_partners = true;
      }

      part.id = relatedCard.id;
      part.hcid = relatedCard.hcid;
      part.name = relatedCard.name;
      part.set = relatedCard.set;
      part.image = relatedCard.image;
      part.type_line = relatedCard.type_line;
      part.is_draft_partner = true;

      const relatedIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
      if (relatedIndex == -1 || relatedIndex == undefined || !relatedCard.all_parts) {
        pushProp(relatedCard, 'all_parts', cardAsRelated);
      } else {
        relatedCard.all_parts[relatedIndex] = cardAsRelated;
      }
    });
  if (card.kind == 'token' && card.all_parts.some(part => part.component == 'meld_part')) {
    const meldParts = new Map<string, HCRelatedCard>();
    card.all_parts
      .filter(e => e.component == 'meld_part')
      .forEach(part => {
        const relatedCard =
          relateds.get(part.id) ??
          relateds.find(related => textEquals(part.hcid, related.hcid)) ??
          relateds.find(related => textEquals(part.name, related.name));
        if (!relatedCard) {
          throw new Error(
            `updateParts: meld_part not found for token "${card.name}" ` +
              `(${card.hcid}): part id=${part.id}, hcid=${part.hcid}, name=${part.name}`
          );
        }
        part.id = relatedCard.id;
        part.hcid = relatedCard.hcid;
        part.name = relatedCard.name;
        part.set = relatedCard.set;
        part.image = relatedCard.image;
        part.type_line = relatedCard.type_line;
        if (part.count) {
          delete part.count;
        }
        if (relatedCard.tags?.includes('draftpartner')) {
          part.is_draft_partner = true;
        }
        meldParts.set(part.id, part);
      });
    const meldResult: HCRelatedCard = {
      object: HCObject.ObjectType.RelatedCard,
      id: card.id,
      hcid: card.hcid,
      name: card.name,
      set: card.set,
      image: card.image,
      type_line: card.type_line,
      component: 'meld_result',
    };
    meldParts.set(card.id, meldResult);
    relateds.set(card);
    for (const id of meldParts.keys()) {
      const relatedCard = relateds.get(id);
      if (!relatedCard) {
        throw new Error(
          `updateParts: meld cross-link not found for token "${card.name}" (${card.hcid}): related id=${id}`
        );
      }
      meldParts.forEach((part, partid) => {
        if (id != partid) {
          const relatedIndex = relatedCard.all_parts?.findIndex(e => e.id == partid);
          if (relatedIndex == -1 || relatedIndex == undefined || !relatedCard.all_parts) {
            pushProp(relatedCard, 'all_parts', part);
          } else {
            relatedCard.all_parts[relatedIndex] = part;
          }
        }
      });
    }
  }
};

/**
 * Cleans the `all_parts` arrays of a card and its related cards (removing stranded parts)
 * @param card card to update
 * @param relateds `CardMap` containing the card's related cards
 */
export const cleanParts = (card: HCCard.Any, relateds: CardMap) => {
  if (card.layout == 'front') return;
  for (let i = card.all_parts?.length! - 1; i >= 0; i--) {
    const part = card.all_parts![i];

    if (card.all_parts!.slice(0, i).find(e => e.id == part.id)) {
      card.all_parts?.splice(i, 1);
    } else if (part.component == 'token') {
      if (!relateds.get(part.id)?.all_parts?.find(e => e.id == card.id)) {
        card.all_parts?.splice(i, 1);
      }
    }
  }
  if (card.all_parts?.length == 0) {
    delete card.all_parts;
  }
};
