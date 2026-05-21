import fs from 'fs';

import { fetchTokens } from './fetchTokens.ts';
import { fetchDatabase } from './fetchdatabase.ts';
import { fetchUsernameMappings } from './fetchUsernameMapping.ts';
import { HCCard, HCCardFace, HCImageStatus, HCRelatedCard, HCObject } from '@hellfall/shared/types';
import { allSetsList } from '@hellfall/shared/data/sets.ts';
import { setDerivedProps, setExportProps } from './derivedProps.ts';
import { fetchNotMagic } from './fetchNotMagic.ts';
import {
  facePropOrder,
  facePropType,
  partPropOrder,
  propOrder,
  propType,
  pushProp,
  stripMasterpiece,
  textEquals,
  textPrep,
} from '@hellfall/shared/utils';
import namesRawData from '@hellfall/shared/data/oracle-names.json';
import {
  addProp,
  addPropToFace,
  deleteProp,
  deletePropFromFace,
  getCardEntries,
  getFaceEntries,
  getFilteredCardEntries,
  getFilteredCardMoveEntries,
  getFilteredCardProps,
  getFilteredFaceMoveEntries,
  getFilteredFaceProps,
} from './fetchUtils.ts';
import { addToJSONToCards } from '@hellfall/shared/utils';

const usingApproved = false;
const typeSet = new Set<string>();
const creatorSet = new Set<string>();
const tagSet = new Set<string>();
const NO_UPDATE_MODE = process.argv.includes('--noupdate');
const NO_SCRYFALL = process.argv.includes('--noscryfall');
const movedIds: Record<string, string> = {
  '219': '6727',
  '219b': '6728',
  '1121': '6729',
  '1121b': '6730',
  '1121c': '6731',
  '1121d': '6732',
  '1121e': '6733',
  '2035': '6734',
  '2035b': '6735',
};
const cardBlankableProps: propType[] = ['mana_cost', 'mana_value', 'oracle_text', 'rulings'];
const cardRemovableProps: propType[] = [
  'flavor_name',
  'export_name',
  'collector_number',
  'image',
  'rotated_image',
  'still_image',
  'supertypes',
  'types',
  'subtypes',
  'flavor_text',
  'power',
  'toughness',
  'loyalty',
  'defense',
  'draft_image_status',
  'draft_image',
  'rotated_draft_image',
  'still_draft_image',
  'not_directly_draftable',
  'has_draft_partners',
  'watermark',
  'frame_effects',
  'tags',
  'tag_notes',
  'all_parts',
];
const cardFaceRemovableProps: facePropType[] = ['compress_face', 'frame'];
const tokenIgnoreProps: propType[] = [
  'mana_cost',
  'mana_value',
  'subtypes',
  'oracle_text',
  'colors',
  'rulings',
];
const tokenRemovableProps: propType[] = [
  'flavor_name',
  'export_name',
  'collector_number',
  'image',
  'rotated_image',
  'still_image',
  'supertypes',
  'types',
  'power',
  'toughness',
  'not_directly_draftable',
  'has_draft_partners',
  'watermark',
  'frame_effects',
  'tags',
  'tag_notes',
  'all_parts',
];
const tokenFaceRemovableProps: facePropType[] = ['frame'];
const notMagicBlankableProps: propType[] = ['mana_value', 'oracle_text'];
const notMagicRemovableProps: propType[] = [
  'image',
  'supertypes',
  'types',
  'subtypes',
  'flavor_text',
  'power',
  'toughness',
  'loyalty',
  'defense',
  'not_directly_draftable',
  'has_draft_partners',
  'tags',
];
const cardUninferrableProps: propType[] = [
  'scryfall_id',
  'oracle_id',
  'image_status',
  'draft_image_status',
  'keywords',
  'variation',
  'variation_of',
];
const cardMoveProps: (propType & facePropType)[] = [
  'attraction_lights',
  'colors',
  'color_indicator',
];
const tokenInferrableProps: propType[] = [
  'id',
  'name',
  'flavor_name',
  'set',
  'collector_number',
  'image',
  'rotated_image',
  'still_image',
  'draft_image',
  'rotated_draft_image',
  'still_draft_image',
  'not_directly_draftable',
  'has_draft_partners',
  'legalities',
  'creators',
  'artists',
  'artist_notes',
  'finish',
  'watermark',
  'border_color',
  'frame',
  'frame_effects',
  'tags',
  'tag_notes',
];
const tokenInferrableFaceProps: facePropType[] = [
  'compress_face',
  'drop_face',
  'supertypes',
  'types',
  'power',
  'toughness',
];
/**
 *
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 * @returns
 */
const mergeCards = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  if ('card_faces' in existingCard != 'card_faces' in newCard) {
    if (existingCard.isActualToken && existingCard.set != 'SFT') {
      const merged: HCCard.Any =
        'card_faces' in existingCard ? { ...existingCard } : { ...newCard };
      if ('card_faces' in merged) {
        getFilteredCardEntries(newCard, tokenInferrableProps).forEach(([key, value]) =>
          addProp(merged, key, value)
        );
        getFilteredCardEntries(newCard, tokenInferrableFaceProps).forEach(([key, value]) =>
          addProp(merged, key, value)
        );
      }
      setDerivedProps(merged);
      return merged;
    } else {
      const merged: HCCard.Any = { ...newCard };
      getFilteredCardEntries(existingCard, cardUninferrableProps).forEach(([key, value]) =>
        addProp(merged, key, value)
      );
      if ('card_faces' in merged) {
        getFilteredCardMoveEntries(existingCard, cardMoveProps).forEach(([key, value]) =>
          addPropToFace(merged, key, value)
        );
      } else if ('card_faces' in existingCard) {
        getFilteredFaceMoveEntries(existingCard, cardMoveProps).forEach(([key, value]) =>
          addProp(merged, key, value)
        );
      }

      setDerivedProps(merged);
      return merged;
    }
  }

  const merged: HCCard.Any = { ...existingCard };
  getCardEntries(newCard).forEach(([key, value]) => {
    if (value) {
      if (
        key === 'card_faces' &&
        Array.isArray(value) &&
        'card_faces' in merged &&
        'card_faces' in existingCard &&
        'card_faces' in newCard
      ) {
        newCard.card_faces.forEach((face, index) => {
          if (index < merged.card_faces.length) {
            getFaceEntries(newCard, index).forEach(([k, v]) => {
              if (k == 'colors' && existingCard.set != 'SFT') {
                // TODO: store current version and print the diff if there is one
              } else if (k == 'image_status' && face.image) {
                // TODO: store current version and print the diff if there is one
              } else if (
                merged.isActualToken &&
                tokenIgnoreProps.includes(k) &&
                merged.set != 'SFT'
              ) {
              } else if (
                v ||
                (!(merged.isActualToken && merged.set != 'SFT') && cardBlankableProps.includes(k))
              ) {
                addPropToFace(merged, k, v, index);
              }
            });
            if (merged.isActualToken && merged.set == 'HCT') {
              getFilteredFaceProps(existingCard, tokenRemovableProps as facePropType[], index)
                .filter(prop => !face[prop])
                .forEach(prop => {
                  if (prop == 'image') {
                    addPropToFace(merged, 'image_status', face.image_status);
                  }
                  deletePropFromFace(merged, prop, index);
                });
              getFilteredFaceProps(existingCard, tokenFaceRemovableProps, index)
                .filter(prop => !face[prop])
                .forEach(prop => {
                  if (prop == 'image') {
                    addPropToFace(merged, 'image_status', face.image_status);
                  }
                  deletePropFromFace(merged, prop, index);
                });
            } else {
              getFilteredFaceProps(existingCard, cardRemovableProps as facePropType[], index)
                .filter(prop => !face[prop])
                .forEach(prop => {
                  if (prop == 'image') {
                    addPropToFace(merged, 'image_status', face.image_status);
                  }
                  deletePropFromFace(merged, prop, index);
                });
              getFilteredFaceProps(existingCard, cardFaceRemovableProps, index)
                .filter(prop => !face[prop])
                .forEach(prop => {
                  if (prop == 'image') {
                    addPropToFace(merged, 'image_status', face.image_status);
                  }
                  deletePropFromFace(merged, prop, index);
                });
            }
          }
        });
        while (merged.card_faces.length < newCard.card_faces.length) {
          merged.card_faces.push(newCard.card_faces[merged.card_faces.length]);
        }
      } else if (key == 'image_status') {
        // TODO: store current version and print the diff if there is one
        if (!('image_status' in merged) || merged.image_status == HCImageStatus.Missing) {
          merged.image_status = value as HCImageStatus;
        }
      } else if (key == 'draft_image_status') {
        // TODO: store current version and print the diff if there is one
      } else if (key in merged && key == 'name' && merged.tags?.includes('irregular-name')) {
        merged.flavor_name = value;
        // TODO: store current version and print the diff if there is one
      } else if (merged.isActualToken && tokenIgnoreProps.includes(key) && merged.set != 'SFT') {
      } else if (key == 'all_parts' && existingCard.all_parts && newCard.all_parts) {
        merged.all_parts = newCard.all_parts?.map(part => {
          // is true when the thing that makes this is itself a token
          const tokenIsMaker = !!(part.name && part.id);
          const existingPart = tokenIsMaker
            ? existingCard.all_parts?.find(e => textEquals(e.id, part.id))
            : existingCard.all_parts?.find(
                e => textEquals(e.name, part.name) && e.name != e.id.replace(/\d+$/, '')
              );
          if (existingPart) {
            // if there is already a part, update it
            Object.entries(existingPart).forEach(([k, v]) => {
              if (!['name', 'component' /**,'is_draft_partner'*/].includes(k) && v) {
                (part as any)[k] = v;
              }
            });
          }
          return part;
        });
      } else if (key == 'layout') {
        // TODO: store current version and print the diff if there is one
        if (
          !('card_faces' in merged) &&
          !('card_faces' in newCard) /**&&
          (merged.layout == HCLayout.Normal || merged.layout == HCLayout.Token)*/
        ) {
          merged.layout = value as typeof newCard.layout;
        } else if ('card_faces' in merged && 'card_faces' in newCard) {
          merged.layout = value as typeof newCard.layout;
        }
      } else if (merged.set == 'NotMagic' && key == 'rulings') {
        // TODO: store current version and print the diff if there is one
        // TODO: store current version and print the diff if there is one
      } else if (!['keywords', 'variation'].includes(key)) {
        addProp(merged, key, value);
      }
    } else if (
      !(merged.isActualToken && merged.set != 'SFT') &&
      merged[key as keyof typeof merged] &&
      cardBlankableProps.includes(key)
    ) {
      addProp(merged, key, value);
    } else if (
      merged.set == 'NotMagic' &&
      merged[key as keyof typeof merged] &&
      notMagicBlankableProps.includes(key)
    ) {
      addProp(merged, key, value);
    }
  });
  if (!merged.isActualToken || merged.set == 'SFT') {
    getFilteredCardProps(existingCard, cardRemovableProps)
      .filter(prop => !(prop in newCard))
      .forEach(prop => {
        if (prop == 'image') {
          addProp(merged, 'image_status', newCard.image_status);
        } else if (prop == 'draft_image') {
          deleteProp(merged, 'draft_image_status');
        }
        deleteProp(merged, prop);
      });
  } else if (merged.set != 'NotMagic') {
    getFilteredCardProps(existingCard, tokenRemovableProps)
      .filter(prop => !(prop in newCard))
      .forEach(prop => {
        if (prop == 'image') {
          addProp(merged, 'image_status', newCard.image_status);
        } else if (prop == 'draft_image') {
          deleteProp(merged, 'draft_image_status');
        }
        deleteProp(merged, prop);
      });
  } else {
    getFilteredCardProps(existingCard, notMagicRemovableProps)
      .filter(prop => !(prop in newCard))
      .forEach(prop => {
        if (prop == 'image') {
          addProp(merged, 'image_status', newCard.image_status);
        } else if (prop == 'draft_image') {
          deleteProp(merged, 'draft_image_status');
        }
        deleteProp(merged, prop);
      });
  }
  if (
    merged.variation &&
    merged.isActualToken &&
    merged.set != 'SFT' &&
    parseInt(merged.variation_of!)
  ) {
    merged.variation_of = merged.name + merged.variation_of;
  }
  setDerivedProps(merged);
  return merged;
};
const mergeDatabases = (
  existingCards: HCCard.Any[],
  newCards: HCCard.Any[],
  existingTokens: HCCard.Any[],
  newTokens: HCCard.Any[]
): { mergedCards: HCCard.Any[]; mergedTokens: HCCard.Any[] } => {
  // const newCardMap = new Map(newCards.map(card => [card.id, card]));
  const existingCardMap = new Map(existingCards.map(card => [card.id, card]));
  // const newTokenMap = new Map(newTokens.map(token => [token.id, token]));
  const existingTokenMap = new Map(existingTokens.map(token => [token.id.toLowerCase(), token]));

  const mergedCards = newCards.map(newCard => {
    const existingCard = !(newCard.id in movedIds)
      ? existingCardMap.get(newCard.id)
      : existingCardMap.get(movedIds[newCard.id]);
    if (existingCard) {
      existingCardMap.delete(existingCard.id);
      return mergeCards(existingCard, newCard);
    }
    return newCard;
  });
  if (usingApproved) {
    mergedCards.push(
      ...Array.from(
        existingCardMap.values().map(card => {
          setDerivedProps(card);
          return card;
        })
      )
    );
  }

  const mergedTokens = newTokens.map(newToken => {
    const existingToken = !(newToken.id in movedIds)
      ? existingTokenMap.get(newToken.id?.toLowerCase())
      : existingTokenMap.get(movedIds[newToken.id]);
    if (existingToken) {
      existingTokenMap.delete(existingToken.id.toLowerCase());
      return mergeCards(existingToken, newToken);
    }
    return newToken;
  });
  if (usingApproved) {
    mergedTokens.push(
      ...Array.from(
        existingTokenMap.values().map(Token => {
          setDerivedProps(Token);
          return Token;
        })
      )
    );
  } else if (NO_SCRYFALL) {
    mergedTokens.push(
      ...Array.from(
        existingTokenMap
          .values()
          .filter(token => token.set == 'SFT')
          .map(Token => {
            setDerivedProps(Token);
            return Token;
          })
      )
    );
  }

  return { mergedCards, mergedTokens };
};
const dataToCards = (
  cards: any,
  missingProp: string = '',
  missingPropValue: any = '',
  addTo: '' | 'cards' | 'faces' | 'parts' = ''
) => {
  switch (addTo) {
    case '':
      return cards as HCCard.Any[];
    case 'cards':
      return cards.map((card: any) => {
        if (!(missingProp in card)) {
          return {
            ...card,
            [missingProp]: missingPropValue,
          } as HCCard.Any;
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
    case 'faces':
      return cards.map((card: any) => {
        if ('card_faces' in card) {
          card.card_faces = card.card_faces.map((face: any) => {
            if (!(missingProp in face)) {
              return {
                ...face,
                [missingProp]: missingPropValue,
              } as HCCardFace.MultiFaced;
            }
            return face as HCCardFace.MultiFaced;
          });
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
    case 'parts':
      return cards.map((card: any) => {
        if ('all_parts' in card) {
          card.all_parts = card.all_parts.map((part: any) => {
            if (!(missingProp in part)) {
              return {
                ...part,
                [missingProp]: missingPropValue,
              } as HCRelatedCard;
            }
            return part as HCRelatedCard;
          });
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
  }
};
const loadExistingData = () => {
  const databasePath = '../shared/src/data/Hellscube-Database.json';
  const tokensPath = '../shared/src/data/tokens.json';

  let databaseContent = undefined;
  let tokensContent = undefined;

  try {
    databaseContent = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load cards, proceeding with undefined content:', error);
  }

  const existingCards = databaseContent
    ? dataToCards(databaseContent.data.filter((e: any) => !e.isActualToken) || [])
    : [];

  try {
    tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load tokens, proceeding with undefined content:', error);
  }

  const existingTokens = tokensContent ? dataToCards(tokensContent.data || []) : [];
  return { existingCards, existingTokens };
};
const main = async () => {
  const { data: newCards } = { data: await fetchDatabase() };
  const usernameMappings = await fetchUsernameMappings();
  const tokenExcludedIds = ['the first pick1'];
  const intTokens = (await fetchTokens(NO_SCRYFALL)).filter(e => !tokenExcludedIds.includes(e.id));
  const intNotMagic = await fetchNotMagic();
  const newTokens = intTokens.concat(intNotMagic);
  let finalCards = newCards;
  let finalTokens = newTokens;
  if (!NO_UPDATE_MODE) {
    console.log('Running in update mode - merging with existing data...');
    const { existingCards, existingTokens } = loadExistingData();
    const merged = mergeDatabases(existingCards, newCards, existingTokens, newTokens);
    finalCards = merged.mergedCards;
    finalTokens = merged.mergedTokens as HCCard.AnySingleFaced[];
  } else {
    console.log('Running in overwrite mode - using fresh data only...');
  }

  finalTokens
    .filter(e => 'all_parts' in e)
    .forEach(token => {
      // add all tokens to all_parts
      token.all_parts
        ?.filter(e => e.component == 'token_maker')
        .forEach(tokenMaker => {
          const relatedToken: HCRelatedCard = {
            object: HCObject.ObjectType.RelatedCard,
            id: token.id,
            name: token.name,
            set: token.set,
            image: token.image,
            type_line: token.type_line,
            component: 'token',
          };
          if (tokenMaker.count) {
            relatedToken.count = tokenMaker.count;
          }
          // goes by id if possible, but if not, it goes by name; tries to find in cards, then tries in tokens
          const relatedCard = tokenMaker.id
            ? finalCards.find(card => card.id == tokenMaker.id)
              ? finalCards.find(card => card.id == tokenMaker.id)
              : finalTokens.find(card => textEquals(card.id, tokenMaker.id))
            : finalCards.find(card => textEquals(card.name, tokenMaker.name))
            ? finalCards.find(card => textEquals(card.name, tokenMaker.name))
            : finalTokens.find(card => textEquals(card.id, tokenMaker.name));
          if (relatedCard) {
            // update token.all_parts
            tokenMaker.id = relatedCard.id;
            tokenMaker.name = relatedCard.name;
            tokenMaker.set = relatedCard.set;
            tokenMaker.image = relatedCard.image;
            tokenMaker.type_line = relatedCard.type_line;
            if (relatedCard.tags?.includes('persistent-tokens')) {
              tokenMaker.persistent = true;
              relatedToken.persistent = true;
            }
            // update relatedCard.all_parts

            const tokenIndex = relatedCard.all_parts?.findIndex(e => e.id == token.id);
            if (tokenIndex == -1 || tokenIndex == undefined || !relatedCard.all_parts) {
              pushProp(relatedCard, 'all_parts', relatedToken);
            } else {
              relatedCard.all_parts[tokenIndex] = relatedToken;
            }
            // if stickers or AddCards, add draftpartner props
            if (
              (token.type_line.includes('Stickers') &&
                relatedCard.tags?.includes('draftpartner')) ||
              (relatedCard.tags?.includes('AddCards') &&
                token.id != 'Ticket Counter1' &&
                (!relatedCard.tag_notes?.['AddCards'] ||
                  parseInt(relatedCard.tag_notes['AddCards']) ||
                  relatedCard.tag_notes['AddCards'] == token.id))
            ) {
              relatedCard.has_draft_partners = true;
              token.has_draft_partners = true;
              token.not_directly_draftable = true;
              tokenMaker.is_draft_partner = true;
              relatedCard.all_parts!.find(e => e.id == token.id)!.is_draft_partner = true;
            }
          }
        });
      const meldPartIds: string[] = [];
      const meldRelatedCards: HCRelatedCard[] = [];
      token.all_parts
        ?.filter(e => e.component == 'meld_part')
        .forEach(meldPart => {
          const relatedCard = finalCards.find(card =>
            meldPart.id ? card.id == meldPart.id : textEquals(card.name, meldPart.name)
          );
          if (relatedCard) {
            meldPart.id = relatedCard.id;
            meldPartIds.push(relatedCard.id);
            meldPart.name = relatedCard.name;
            meldPart.set = relatedCard.set;
            meldPart.image = relatedCard.image;
            meldPart.type_line = relatedCard.type_line;
            if (meldPart.count) {
              delete meldPart.count;
            }
            if (relatedCard.tags?.includes('draftpartner')) {
              meldPart.is_draft_partner = true;
            }
            meldRelatedCards.push(meldPart);
          }
        });
      const meldResult: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: token.id,
        name: token.name,
        set: token.set,
        image: token.image,
        type_line: token.type_line,
        component: 'meld_result',
      };
      meldRelatedCards.push(meldResult);
      meldPartIds.forEach(id => {
        const relatedCard = finalCards.find(card => card.id == id) as HCCard.Any;
        meldRelatedCards
          .filter(e => e.id != id)
          .forEach(meldPart => {
            const meldIndex = relatedCard.all_parts?.findIndex(e => e.id == meldPart.id);
            if (meldIndex == -1 || meldIndex == undefined || !relatedCard.all_parts) {
              pushProp(relatedCard, 'all_parts', meldPart);
            } else {
              relatedCard.all_parts[meldIndex] = meldPart;
            }
          });
      });
    });
  // update cards that have token copies of them made by other cards or by tokens
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      card.all_parts
        ?.filter(e => e.component == 'token_maker')
        .forEach(tokenMaker => {
          const relatedToken: HCRelatedCard = {
            object: HCObject.ObjectType.RelatedCard,
            id: card.id,
            name: card.name,
            set: card.set,
            image: card.image,
            type_line: card.type_line,
            component: 'token',
          };
          if (tokenMaker.count) {
            relatedToken.count = tokenMaker.count;
          }
          const relatedCard = tokenMaker.id
            ? finalCards.find(card => card.id == tokenMaker.id)
              ? finalCards.find(card => card.id == tokenMaker.id)
              : finalTokens.find(card => textEquals(card.id, tokenMaker.id))
            : finalCards.find(card => textEquals(card.name, tokenMaker.name))
            ? finalCards.find(card => textEquals(card.name, tokenMaker.name))
            : finalTokens.find(card => textEquals(card.id, tokenMaker.name));
          if (relatedCard) {
            tokenMaker.id = relatedCard.id;
            tokenMaker.name = relatedCard.name;
            tokenMaker.set = relatedCard.set;
            tokenMaker.image = relatedCard.image;
            tokenMaker.type_line = relatedCard.type_line;
            if (relatedCard.tags?.includes('persistent-tokens')) {
              tokenMaker.persistent = true;
              relatedToken.persistent = true;
            }
            const tokenIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
            if (tokenIndex == -1 || tokenIndex == undefined || !relatedCard.all_parts) {
              pushProp(relatedCard, 'all_parts', relatedToken);
            } else {
              relatedCard.all_parts[tokenIndex] = relatedToken;
            }
          }
        });
    });
  // update draftpartners
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      card.all_parts
        ?.filter(e => e.component == 'draft_partner')
        .forEach(partnerCard => {
          const relatedPartner: HCRelatedCard = {
            object: HCObject.ObjectType.RelatedCard,
            id: card.id,
            name: card.name,
            set: card.set,
            image: card.image,
            type_line: card.type_line,
            component: 'draft_partner',
            is_draft_partner: true,
          };
          if (partnerCard.count) {
            relatedPartner.count = partnerCard.count;
          }
          const relatedCard = finalCards.find(e =>
            partnerCard.id ? e.id == partnerCard.id : textEquals(e.name, partnerCard.name)
          );
          if (relatedCard) {
            if (!('has_draft_partners' in relatedCard!)) {
              relatedCard!.has_draft_partners = true;
            }
            if (!('has_draft_partners' in card)) {
              card.has_draft_partners = true;
            }
            partnerCard.id = relatedCard!.id;
            partnerCard.name = relatedCard!.name;
            partnerCard.set = relatedCard!.set;
            partnerCard.image = relatedCard!.image;
            partnerCard.type_line = relatedCard!.type_line;
            partnerCard.is_draft_partner = true;
            const partnerIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
            if (partnerIndex == -1 || partnerIndex == undefined || !relatedCard.all_parts) {
              pushProp(relatedCard, 'all_parts', relatedPartner);
            } else {
              relatedCard.all_parts[partnerIndex] = relatedPartner;
            }
          }
        });
    });
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      for (let i = card.all_parts?.length! - 1; i >= 0; i--) {
        const part = card.all_parts![i];

        if (card.all_parts!.slice(0, i).find(e => e.id == part.id)) {
          card.all_parts?.splice(i, 1);
        } else if (part.component == 'token') {
          if (finalCards.find(e => e.id == part.id)) {
            if (
              !(
                finalCards.find(e => e.id == part.id)?.all_parts?.find(e => e.id == card.id)
                  ?.component == 'token_maker'
              )
            ) {
              card.all_parts?.splice(i, 1);
            }
          } else {
            if (
              !(
                finalTokens
                  .find(e => textEquals(e.id, part.id))
                  ?.all_parts?.find(e => e.id == card.id)?.component == 'token_maker'
              )
            ) {
              card.all_parts?.splice(i, 1);
            }
          }
        }
      }
      if (card.all_parts?.length == 0) {
        delete card.all_parts;
      }
    });

  finalTokens
    .filter(e => 'all_parts' in e)
    .forEach(token => {
      for (let i = token.all_parts?.length! - 1; i >= 0; i--) {
        const part = token.all_parts![i];
        if (
          token.all_parts!.slice(0, i).find(e => e.id == part.id) ||
          (part.component == 'token' &&
            !(
              finalTokens
                .find(e => textEquals(e.id, part.id))
                ?.all_parts?.find(e => e.id == token.id)?.component == 'token_maker'
            ))
        ) {
          token.all_parts?.splice(i, 1);
        }
      }
      if (token.all_parts?.length == 0) {
        delete token.all_parts;
      }
    });
  // automatically add variations for masterpieces
  finalCards
    .filter(entry => entry.tags?.includes('masterpiece') && !entry.variation)
    .forEach(entry => {
      const varName = stripMasterpiece(entry.name);
      const variation_of = finalCards.find(card => textEquals(card.name, varName))?.id;
      if (variation_of) {
        entry.variation = true;
        entry.variation_of = variation_of;
      }
    });
  // automatically add collector numbers and export props
  const collectorNumberAutofillSets: Record<string, number> = {
    'HCV.2': 0,
    'HCV.3': 0,
    'HCV.4': 0,
    'HCV.6': 0,
    'HCV.7': 0,
    'HCV.8': 0,
    'HCV.9': 0,
    'HC9.0': 0,
    HC9: 0,
    'HCV.J': 0,
    'HCV.K': 0,
    'HCV.L': 0,
    'HCV.P': 0,
    'HCV.CDC': 0,
    NRM: 0,
    HCJ: 0,
    NotMagic: 0,
    SFT: 0,
  };
  const takenNames = namesRawData.data;
  finalCards.forEach(entry => {
    setExportProps(entry, takenNames);
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw console.error;
      }
    }
  });
  finalTokens.forEach(entry => {
    setExportProps(entry, takenNames);
    if (!entry.collector_number) {
      if (entry.set in collectorNumberAutofillSets) {
        collectorNumberAutofillSets[entry.set] += 1;
        entry.collector_number = collectorNumberAutofillSets[entry.set].toString();
      } else {
        throw console.error;
      }
    }
  });
  finalCards.forEach(entry => {
    ('card_faces' in entry ? entry.card_faces : [entry]).forEach(face => {
      [...(face.supertypes || []), ...(face.types || []), ...(face.subtypes || [])].forEach(
        typeEntry => {
          typeSet.add(textPrep(typeEntry.replaceAll(/[[\]{}\*_~]/g, ''), true));
        }
      );
    });

    entry.creators = entry.creators.map(creator => {
      if (creator in usernameMappings) {
        creatorSet.add(usernameMappings[creator]);
        return usernameMappings[creator];
      }
      creatorSet.add(creator);
      return creator;
    });

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e));
    }
  });
  finalTokens.forEach(entry => {
    ('card_faces' in entry ? entry.card_faces : [entry]).forEach(face => {
      [...(face.supertypes || []), ...(face.types || []), ...(face.subtypes || [])].forEach(
        typeEntry => {
          typeSet.add(textPrep(typeEntry.replaceAll(/[[\]{}\*_~]/g, ''), true));
        }
      );
    });

    entry.creators = entry.creators.map(creator => {
      if (creator in usernameMappings) {
        creatorSet.add(usernameMappings[creator]);
        return usernameMappings[creator];
      }
      creatorSet.add(creator);
      return creator;
    });

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e));
    }
  });

  const types = Array.from(typeSet).sort((a, b) => {
    if (a > b) {
      return 1;
    }
    return -1;
  });
  const reducedTypes: string[] = [];
  const preferLower = ['a', 'an', 'and', 'in', 'of', 'the'];
  const preferUpper = ['EVIL', 'HELL', 'WET'];
  types.forEach(type => {
    const index = reducedTypes.findIndex(e => e.toLowerCase() == type.toLowerCase());
    if (index == -1) {
      reducedTypes.push(type);
    } else if (
      preferLower.includes(type) ||
      (type[0].toUpperCase() == type[0] && !preferUpper.includes(reducedTypes[index]))
    ) {
      reducedTypes.splice(index, 1);
      reducedTypes.push(type);
    }
  });
  const creators = Array.from(creatorSet);
  const tags = Array.from(tagSet);

  finalCards.sort((a, b) => {
    if (parseInt(a.id) == parseInt(b.id)) {
      if (a.id > b.id) {
        return 1;
      }
      return -1;
    } else if (parseInt(a.id) > parseInt(b.id)) {
      return 1;
    }
    return -1;
  });
  finalTokens.sort((a, b) => {
    // if (a.layout != b.layout) {
    //   if (
    //     HCLayoutGroup.TokenLayout.indexOf(a.layout as HCLayoutGroup.TokenLayoutType) >
    //     HCLayoutGroup.TokenLayout.indexOf(b.layout as HCLayoutGroup.TokenLayoutType)
    //   ) {
    //     return 1;
    //   }
    //   return -1;
    // }
    if (a.set != b.set) {
      return allSetsList.indexOf(a.set) - allSetsList.indexOf(b.set);
    }
    if (a.collector_number && b.collector_number) {
      return parseInt(a.collector_number) - parseInt(b.collector_number);
    }
    if (a.name == b.name) {
      if (
        (parseInt(a.id.match(/\d+$/)?.[0] || '') || 0) >
        (parseInt(b.id.match(/\d+$/)?.[0] || '') || 0)
      ) {
        return 1;
      }
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return -1;
  });

  fs.writeFileSync(
    '../shared/src/data/types.json',
    JSON.stringify({ data: reducedTypes }, null, '\t')
  );
  fs.writeFileSync(
    '../shared/src/data/tokens.json',
    JSON.stringify({ data: addToJSONToCards(finalTokens) }, null, '\t')
  );
  fs.writeFileSync(
    '../shared/src/data/tags.json',
    JSON.stringify(
      {
        data: tags.sort((a, b) => {
          if (a > b) {
            return 1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );

  fs.writeFileSync(
    '../shared/src/data/creators.json',
    JSON.stringify(
      {
        data: creators.sort((a, b) => {
          if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
          }
          return -1;
        }),
      },
      null,
      '\t'
    )
  );

  fs.writeFileSync(
    '../shared/src/data/Hellscube-Database.json',
    JSON.stringify(
      {
        data: addToJSONToCards(finalCards).concat(addToJSONToCards(finalTokens)),
      },
      null,
      '\t'
    )
  );
};

main();
