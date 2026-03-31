import fs from 'fs';

import { fetchTokens } from './fetchTokens';
import { fetchDatabase } from './fetchdatabase';
import { fetchUsernameMappings } from './fetchUsernameMapping';
import {
  HCCard,
  HCCardFace,
  HCImageStatus,
  HCLayout,
  HCRelatedCard,
  HCLayoutGroup,
  HCColor,
  HCColors,
} from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';
import { getDefaultStore } from 'jotai';
import { loadPips, pipsAtom } from '../../src/hellfall/atoms/pipsAtom';
import { getColorIdentityProps, setDerivedProps } from './derivedProps';
import { fetchNotMagic } from './fetchNotMagic';
import { stripMasterpiece, textEquals } from './textHandling';
const usingApproved = false;
const typeSet = new Set<string>();
const creatorSet = new Set<string>();
const tagSet = new Set<string>();
const UPDATE_MODE = process.argv.includes('--update');
const oneWayMergeProps = [
  'name',
  'mana_cost',
  'color_indicator',
  'supertypes',
  'types',
  'type_line',
  'subtypes',
  'oracle_text',
  'flavor_text',
  'power',
  'toughness',
  'loyalty',
  'defense',
  'hand_modifier',
  'life_modifier',
  'attraction_lights',
  'watermark',
  'colors',
  'cmc',
];
const cardBlankableProps = ['rulings', 'oracle_text', 'cmc', 'mana_cost'];
const cardRemovableProps = [
  'tags',
  'tag_notes',
  'defense',
  'loyalty',
  'power',
  'toughness',
  'supertypes',
  'types',
  'subtypes',
  'flavor_text',
  'image',
  'draft_image',
  'not_directly_draftable',
  'has_draft_partners',
  'watermark',
];
// const tokenBlankableProps = []
const tokenRemovableProps = [
  'power',
  'toughness',
  'supertypes',
  'types',
  'image',
  'draft_image',
  'not_directly_draftable',
  'has_draft_partners',
];
const notMagicBlankableProps = ['oracle_text', 'cmc'];
const notMagicRemovableProps = [
  'tags',
  'defense',
  'loyalty',
  'power',
  'toughness',
  'supertypes',
  'types',
  'subtypes',
  'flavor_text',
  'image',
  'draft_image',
  'not_directly_draftable',
  'has_draft_partners',
];

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
const stayUnapprovedLayouts: HCLayout[] = [
  HCLayout.MeldPart,
  HCLayout.MeldResult,
  HCLayout.MultiToken,
  HCLayout.MultiReminder,
  HCLayout.RealCardMultiToken,
  HCLayout.MultiNotMagic,
];
const partialMergeOnlyLayouts: HCLayout[] = [
  HCLayout.MultiToken,
  HCLayout.MultiReminder,
  HCLayout.RealCardMultiToken,
  HCLayout.MultiNotMagic,
];

const addToJSONToCards = (cards: HCCard.Any[]): HCCard.Any[] => {
  return cards.map(card => {
    const cardWithJSON = Object.assign({}, card, {
      toJSON(this: Record<string, any>) {
        const ordered: Record<string, any> = {};
        const propOrder = [
          'id',
          'scryfall_id',
          'oracle_id',
          'name',
          'set',
          'image_status',
          'image',
          'layout',
          'mana_cost',
          'cmc',
          'supertypes',
          'types',
          'subtypes',
          'type_line',
          'oracle_text',
          'flavor_text',
          'power',
          'toughness',
          'loyalty',
          'defense',
          'hand_modifier',
          'life_modifier',
          'attraction_lights',
          'colors',
          'color_indicator',
          'color_identity',
          'color_identity_hybrid',
          'draft_image_status',
          'draft_image',
          'not_directly_draftable',
          'has_draft_partners',
          'keywords',
          'legalities',
          'creators',
          'rulings',
          'watermark',
          'tags',
          'tag_notes',
          'variation',
          'variation_of',
          'isActualToken',
        ];
        const facePropOrder = [
          'name',
          'image_status',
          'image',
          'mana_cost',
          'cmc',
          'supertypes',
          'types',
          'subtypes',
          'type_line',
          'oracle_text',
          'flavor_text',
          'power',
          'toughness',
          'loyalty',
          'defense',
          'hand_modifier',
          'life_modifier',
          'attraction_lights',
          'colors',
          'color_indicator',
          'watermark',
        ];
        const partPropOrder = [
          'id',
          'name',
          'set',
          'image',
          'type_line',
          'component',
          'is_draft_partner',
        ];
        propOrder.forEach(prop => {
          if (prop in this) {
            ordered[prop] = this[prop];
          }
        });
        if ('card_faces' in this) {
          ordered.card_faces = this.card_faces.map((face: Record<string, any>) => {
            const orderedFace: Record<string, any> = {};
            facePropOrder.forEach(prop => {
              if (prop in face) {
                orderedFace[prop] = face[prop];
              }
            });
            return orderedFace;
          });
        }
        if ('all_parts' in this) {
          ordered.all_parts = this.all_parts.map((part: Record<string, any>) => {
            const orderedPart: Record<string, any> = {};
            partPropOrder.forEach(prop => {
              if (prop in part) {
                orderedPart[prop] = part[prop];
              }
            });
            return orderedPart;
          });
        }
        return ordered;
      },
    });
    return cardWithJSON as HCCard.Any;
  });
};
/**
 *
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 * @returns
 */
const mergeCards = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  if (
    usingApproved &&
    (existingCard.has_draft_partners ||
      stayUnapprovedLayouts.includes(existingCard.layout as HCLayout) ||
      ('card_faces' in existingCard && existingCard.card_faces.length > 4))
  ) {
    setDerivedProps(existingCard);
    return existingCard;
  }
  // TODO: replace with actual type checking
  if (
    partialMergeOnlyLayouts.includes(existingCard.layout as HCLayout) &&
    existingCard.set.slice(0, 2) != 'SF'
  ) {
    const merged: HCCard.Any = { ...existingCard };
    ['image', 'creators', 'all_parts'].forEach(key => {
      if (newCard[key as keyof typeof newCard]) {
        (merged as any)[key] = newCard[key as keyof typeof newCard];
      }
    });
    setDerivedProps(merged);
    return merged;
  }

  let mergedPrelim: any = undefined;
  if (!('card_faces' in existingCard) && 'card_faces' in newCard) {
    mergedPrelim = { ...existingCard } as any;
    mergedPrelim.card_faces = [{}] as HCCardFace.MultiFaced[];
    oneWayMergeProps.forEach(prop => {
      if (prop in mergedPrelim) {
        mergedPrelim.card_faces[0][prop] = mergedPrelim[prop];
        if (!['name', 'mana_cost', 'type_line', 'colors', 'cmc'].includes(prop)) {
          delete mergedPrelim[prop];
        }
      }
    });
    mergedPrelim.card_faces[0]['image_status'] = HCImageStatus.Front;
    mergedPrelim.layout = newCard.layout;
  } else if ('card_faces' in existingCard && !('card_faces' in newCard)) {
    mergedPrelim = { ...existingCard } as any;
    oneWayMergeProps.forEach(prop => {
      if (prop in mergedPrelim.card_faces[0]) {
        mergedPrelim[prop] = mergedPrelim.card_faces[0][prop];
      }
    });
    delete mergedPrelim.card_faces;
    mergedPrelim.layout = newCard.layout;
  }

  const merged: HCCard.Any =
    'card_faces' in existingCard == 'card_faces' in newCard
      ? { ...existingCard }
      : 'card_faces' in mergedPrelim
      ? { ...(mergedPrelim as HCCard.AnyMultiFaced) }
      : { ...(mergedPrelim as HCCard.AnySingleFaced) };
  if ('card_faces' in existingCard != 'card_faces' in newCard) {
    setDerivedProps(merged);
  }
  Object.entries(newCard).forEach(([key, value]) => {
    if (value) {
      if (
        key === 'card_faces' &&
        Array.isArray(value) &&
        'card_faces' in merged &&
        'card_faces' in existingCard &&
        'card_faces' in newCard
      ) {
        merged.card_faces = existingCard.card_faces.map((face, index) => {
          if (index < value.length) {
            const newFace = newCard.card_faces?.[index];
            Object.entries(newFace).forEach(([k, v]) => {
              if (k in face && k == 'name' && face[k][0] == ';') {
                // TODO: store current version and print the diff if there is one
              } else if (k == 'colors') {
                // TODO: store current version and print the diff if there is one
              } else if (k == 'image_status' && newFace.image) {
                // TODO: store current version and print the diff if there is one
              } else if (v || (!merged.isActualToken && cardBlankableProps.includes(k))) {
                (face as any)[k] = v;
              }
            });
            cardRemovableProps
              .filter(prop => prop in face && !(prop in newFace))
              .forEach(prop => {
                if (prop == 'image') {
                  face.image_status = newFace.image_status;
                }
                delete (face as any)[prop];
              });
          }
          return face;
        });
        while (merged.card_faces.length < newCard.card_faces.length) {
          merged.card_faces.push(newCard.card_faces[merged.card_faces.length]);
        }
      } else if (key == 'draft_image_status') {
        // TODO: store current version and print the diff if there is one
        if (
          merged.draft_image_status == HCImageStatus.Missing ||
          merged.draft_image_status ==
            HCImageStatus.Inapplicable /*  || face.image_status == HCImageStatus.Split */
        ) {
          (merged as any)[key] = value;
        }
      } else if (['subtypes', 'oracle_text', 'colors'].includes(key) && merged.set == 'HCT') {
        // TODO: store current version and print the diff if there is one
      } else if (key in merged && ['name', 'oracle_text', 'flavor_text'].includes(key)) {
        if ((merged[key as keyof typeof merged]! as string)[0] == ';') {
          // TODO: store current version and print the diff if there is one
        } else if (value) {
          (merged as any)[key] = value;
        }
      } else if (
        key === 'all_parts' &&
        Array.isArray(value) &&
        'all_parts' in merged &&
        'all_parts' in existingCard &&
        'all_parts' in newCard
      ) {
        merged.all_parts = newCard.all_parts?.map(part => {
          // superToken is used when the card is a token and part is also a token that makes this token
          // const superToken = existingCard.all_parts
          //   ?.filter(e => e.name == e.id.replace(/\d+$/, ''))
          //   .find(e => textEquals(e.id, part.name));
          // is true when the thing that makes this is itself a token
          const tokenIsMaker = part.name && part.id;
          const existingPart = tokenIsMaker
            ? existingCard.all_parts?.find(e => textEquals(e.id, part.id))
            : existingCard.all_parts?.find(
                e => textEquals(e.name, part.name) && e.name != e.id.replace(/\d+$/, '')
              );
          // const existingPart =
          //   superToken && existingCard.isActualToken
          //     ? superToken
          //     : existingCard.all_parts?.find(e => textEquals(e.name, part.name) );
          if (existingPart) {
            // if there is already a part, update it
            Object.entries(existingPart).forEach(([k, v]) => {
              if (!['name', 'component' /**,'is_draft_partner'*/].includes(k) && v) {
                (part as any)[k] = v;
                // } else if (k == 'id' && tokenIsMaker) {
                //   part.id = v as string;
                //   part.name = (v as string).replace(/\*\d+$/, '');
              }
            });
          }
          return part;
        });
        existingCard.all_parts
          ?.filter(
            part =>
              !['token_maker'].includes(part.component) &&
              !merged.all_parts?.some(e => e.id == part.id)
          )
          .forEach(part => {
            merged.all_parts?.push(part);
          });
      } else if (key == 'image_status') {
        // TODO: store current version and print the diff if there is one
        if (!('image_status' in merged) || merged.image_status == HCImageStatus.Missing) {
          merged.image_status = value as HCImageStatus;
        }
      } else if (key == 'layout') {
        // TODO: store current version and print the diff if there is one
        if (
          !('card_faces' in merged) &&
          !('card_faces' in newCard) /**&&
          (merged.layout == HCLayout.Normal || merged.layout == HCLayout.Token)*/
        ) {
          merged.layout = value as typeof newCard.layout;
        } else if (
          'card_faces' in merged &&
          'card_faces' in newCard &&
          merged.layout != HCLayout.RealCardMultiToken
        ) {
          merged.layout = value as typeof newCard.layout;
          // if (
          //   merged.layout != HCLayout.Multi &&
          //   !merged.card_faces.at(-1)!.image &&
          //   [HCImageStatus.Split, HCImageStatus.DraftPartner].includes(
          //     merged.card_faces[1].image_status as HCImageStatus
          //   )
          // ) {
          //   merged.card_faces.at(-1)!.image_status = newCard.card_faces.at(-1)!.image_status;
          // }
        }
      } else if (merged.set == 'NotMagic' && key == 'rulings') {
        // TODO: store current version and print the diff if there is one
      } else if (!['keywords', 'variation'].includes(key)) {
        (merged as any)[key] = value;
      }
    } else if (
      !merged.isActualToken &&
      merged[key as keyof typeof merged] &&
      cardBlankableProps.includes(key)
    ) {
      (merged as any)[key] = value;
    } else if (
      merged.set == 'NotMagic' &&
      merged[key as keyof typeof merged] &&
      notMagicBlankableProps.includes(key)
    ) {
      (merged as any)[key] = value;
    }
  });
  if (!merged.isActualToken) {
    cardRemovableProps
      .filter(key => key in merged && !(key in newCard))
      .forEach(key => {
        if (key == 'image') {
          merged.image_status = newCard.image_status;
        } else if (key == 'draft_image') {
          merged.draft_image_status = newCard.draft_image_status;
        }
        delete (merged as any)[key];
      });
  } else if (merged.set == 'HCT') {
    tokenRemovableProps
      .filter(key => key in merged && !(key in newCard))
      .forEach(key => {
        if (key == 'image') {
          merged.image_status = newCard.image_status;
        }
        delete (merged as any)[key];
      });
  } else {
    notMagicRemovableProps
      .filter(key => key in merged && !(key in newCard))
      .forEach(key => {
        if (key == 'image') {
          merged.image_status = newCard.image_status;
        }
        delete (merged as any)[key];
      });
  }
  if (merged.variation && merged.isActualToken && parseInt(merged.variation_of!)) {
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

  // const mergedCards = existingCards.map(existingCard => {
  //   const newCard = !(existingCard.id in movedIds)
  //     ? newCardMap.get(existingCard.id)
  //     : newCardMap.get(movedIds[existingCard.id]);
  //   if (newCard) {
  //     newCardMap.delete(newCard.id);
  //     return mergeCards(existingCard, newCard, usingApproved);
  //   }
  //   return existingCard;
  // });
  // mergedCards.push(
  //   ...Array.from(
  //     newCardMap.values().map(card => {
  //       setDerivedProps(card);
  //       return card;
  //     })
  //   )
  // );
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

  // const mergedTokens = existingTokens.map(existingToken => {
  //   const newToken = !(existingToken.id in movedIds)
  //     ? newTokenMap.get(existingToken.id)
  //     : newTokenMap.get(movedIds[existingToken.id]);
  //   if (newToken) {
  //     newTokenMap.delete(newToken.id);
  //     return mergeCards(existingToken, newToken);
  //   }
  //   return existingToken;
  // });
  // mergedTokens.push(
  //   ...Array.from(
  //     newTokenMap.values().map(token => {
  //       setDerivedProps(token);
  //       return token;
  //     })
  //   )
  // );
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
  const databasePath = './src/data/Hellscube-Database.json';
  const tokensPath = './src/data/tokens.json';

  let databaseContent = undefined;
  let tokensContent = undefined;

  try {
    if (fs.existsSync(databasePath)) {
      databaseContent = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    }
  } catch (error) {
    console.warn('Could not load cards, proceeding with undefined content:', error);
  }

  const existingCards = databaseContent
    ? dataToCards(databaseContent.data.filter((e: any) => !e.isActualToken) || [])
    : [];

  try {
    if (fs.existsSync(tokensPath)) {
      tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    }
  } catch (error) {
    console.warn('Could not load tokens, proceeding with undefined content:', error);
  }

  const existingTokens = tokensContent ? dataToCards(tokensContent.data || []) : [];
  return { existingCards, existingTokens };
};
const main = async () => {
  const store = getDefaultStore();
  const pips = await loadPips();
  store.set(pipsAtom, pips);

  const { data: newCards } = { data: await fetchDatabase() };
  const usernameMappings = await fetchUsernameMappings();
  const tokenExcludedIds = ['the first pick1'];
  const intTokens = (await fetchTokens()).filter(e => !tokenExcludedIds.includes(e.id));
  const intNotMagic = await fetchNotMagic();
  const newTokens = intTokens.concat(intNotMagic);
  let finalCards = newCards;
  let finalTokens = newTokens;
  if (UPDATE_MODE) {
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
      const relatedToken: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: token.id,
        component: 'token',
        name: token.name,
        type_line: token.type_line,
        set: token.set,
        image: token.image,
      };
      token.all_parts
        ?.filter(e => e.component == 'token_maker')
        .forEach(tokenMaker => {
          // goes by id if possible, but if not, it goes by name; tries to find in cards, then tries in tokens
          const relatedCard = tokenMaker.id
            ? finalCards.find(card => card.id == tokenMaker.id)
              ? finalCards.find(card => card.id == tokenMaker.id)
              : finalTokens.find(card => card.id == tokenMaker.id)
            : finalCards.find(card => textEquals(card.name, tokenMaker.name))
            ? finalCards.find(card => textEquals(card.name, tokenMaker.name))
            : finalTokens.find(card => textEquals(card.id, tokenMaker.name));
          if (relatedCard) {
            tokenMaker.id = relatedCard.id;
            tokenMaker.name = relatedCard.name;
            tokenMaker.type_line = relatedCard.type_line;
            tokenMaker.set = relatedCard.set;
            tokenMaker.image = relatedCard.image;
            if ('all_parts' in relatedCard) {
              const tokenIndex = relatedCard.all_parts?.findIndex(e => e.id == token.id);
              if (tokenIndex == -1) {
                relatedCard.all_parts?.push(relatedToken);
              } else {
                relatedCard.all_parts![tokenIndex!] = relatedToken;
              }
            } else {
              relatedCard.all_parts = [relatedToken];
            }
            // if stickers, add draftpartner props
            if (
              token.type_line.includes('Stickers') &&
              relatedCard.tags?.includes('draftpartner')
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
            meldPart.type_line = relatedCard.type_line;
            meldPart.set = relatedCard.set;
            meldPart.image = relatedCard.image;
            // meldPart.image =
            //   'card_faces' in relatedCard && relatedCard.card_faces[0].image ? relatedCard.card_faces[0].image : relatedCard.image;
            if (token.id != 'Omnath, the Forbidden One1') {
              meldPart.is_draft_partner = true;
            }
            meldRelatedCards.push(meldPart);
          }
        });
      if (meldPartIds && meldPartIds.length) {
        const meldResult: HCRelatedCard = {
          object: HCObject.ObjectType.RelatedCard,
          id: token.id,
          component: 'meld_result',
          name: token.name,
          type_line: token.type_line,
          set: token.set,
          image: token.image,
        };
        meldRelatedCards.push(meldResult);
        meldPartIds.forEach(id => {
          const relatedCard = finalCards.find(card => card.id == id);
          if (!relatedCard?.has_draft_partners && token.id != 'Omnath, the Forbidden One1') {
            relatedCard!.has_draft_partners = true;
          }
          meldRelatedCards
            .filter(e => e.id != id)
            .forEach(meldPart => {
              if ('all_parts' in relatedCard!) {
                const meldIndex = relatedCard.all_parts?.findIndex(e => e.id == meldPart.id);
                if (meldIndex == -1) {
                  relatedCard.all_parts?.push(meldPart);
                } else {
                  relatedCard.all_parts![meldIndex!] = meldPart;
                }
              } else {
                relatedCard!.all_parts = [meldPart];
              }
            });
        });
      }
    });
  // update cards that have token copies of them made by other cards or by tokens
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      const relatedToken: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: card.id,
        component: 'token',
        name: card.name,
        type_line: card.type_line,
        set: card.set,
        image: card.image,
      };
      card.all_parts
        ?.filter(e => e.component == 'token_maker')
        .forEach(tokenMaker => {
          const relatedCard = tokenMaker.id
            ? finalCards.find(card => card.id == tokenMaker.id)
              ? finalCards.find(card => card.id == tokenMaker.id)
              : finalTokens.find(card => card.id == tokenMaker.id)
            : finalCards.find(card => textEquals(card.name, tokenMaker.name))
            ? finalCards.find(card => textEquals(card.name, tokenMaker.name))
            : finalTokens.find(card => textEquals(card.id, tokenMaker.name));
          // const relatedCard = finalCards.find(e =>
          //   tokenMaker.id ? e.id == tokenMaker.id : textEquals(e.name, tokenMaker.name)
          // );
          if (relatedCard) {
            tokenMaker.id = relatedCard.id;
            tokenMaker.name = relatedCard.name;
            tokenMaker.type_line = relatedCard.type_line;
            tokenMaker.set = relatedCard.set;
            tokenMaker.image = relatedCard.image;
            if ('all_parts' in relatedCard!) {
              const tokenIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
              if (tokenIndex == -1) {
                relatedCard.all_parts?.push(relatedToken);
              } else {
                relatedCard.all_parts![tokenIndex!] = relatedToken;
              }
            } else {
              relatedCard!.all_parts = [relatedToken];
            }
          }
        });
    });
  // update draftpartners
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      const relatedPartner: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: card.id,
        component: 'draft_partner',
        name: card.name,
        type_line: card.type_line,
        set: card.set,
        image: card.image,
        is_draft_partner: true,
      };
      card.all_parts
        ?.filter(e => e.component == 'draft_partner')
        .forEach(partnerCard => {
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
            partnerCard.type_line = relatedCard!.type_line;
            partnerCard.set = relatedCard!.set;
            partnerCard.image = relatedCard!.image;
            partnerCard.is_draft_partner = true;
            if ('all_parts' in relatedCard!) {
              const partnerIndex = relatedCard.all_parts?.findIndex(e => e.id == card.id);
              if (partnerIndex == -1) {
                relatedCard.all_parts?.push(relatedPartner);
              } else {
                relatedCard.all_parts![partnerIndex!] = relatedPartner;
              }
            } else {
              relatedCard!.all_parts = [relatedPartner];
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
            const tok = finalTokens.find(e => e.id == part.id);
            const pts = finalTokens.find(e => e.id == part.id)?.all_parts;
            const rel = finalTokens
              .find(e => e.id == part.id)
              ?.all_parts?.find(e => e.id == card.id);
            const comp = finalTokens
              .find(e => e.id == part.id)
              ?.all_parts?.find(e => e.id == card.id)?.component;
            if (
              !(
                finalTokens.find(e => e.id == part.id)?.all_parts?.find(e => e.id == card.id)
                  ?.component == 'token_maker'
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
              finalTokens.find(e => e.id == part.id)?.all_parts?.find(e => e.id == token.id)
                ?.component == 'token_maker'
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
  finalCards.forEach(entry => {
    ('card_faces' in entry ? entry.card_faces : [entry]).forEach(face => {
      [...(face.supertypes || []), ...(face.types || []), ...(face.subtypes || [])].forEach(
        typeEntry => {
          typeSet.add(typeEntry);
        }
      );
    });

    const usernameMappingEntries = Object.entries(usernameMappings);

    for (const [replacementName, oldNames] of usernameMappingEntries) {
      for (const oldName of oldNames) {
        const oldIndex = entry.creators.indexOf(oldName);
        if (oldIndex != -1) {
          entry.creators[oldIndex] = replacementName;
        }
      }
    }

    entry.creators.forEach(creator => {
      creatorSet.add(creator);
    });

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e));
    }
  });
  finalTokens.forEach(entry => {
    ('card_faces' in entry ? entry.card_faces : [entry]).forEach(face => {
      [...(face.supertypes || []), ...(face.types || []), ...(face.subtypes || [])].forEach(
        typeEntry => {
          typeSet.add(typeEntry);
        }
      );
    });

    const usernameMappingEntries = Object.entries(usernameMappings);

    for (const [replacementName, oldNames] of usernameMappingEntries) {
      for (const oldName of oldNames) {
        const oldIndex = entry.creators.indexOf(oldName);
        if (oldIndex != -1) {
          entry.creators[oldIndex] = replacementName;
        }
      }
    }

    entry.creators.forEach(creator => {
      creatorSet.add(creator);
    });

    if ('tags' in entry) {
      entry.tags?.forEach(e => tagSet.add(e));
    }

    // if (entry.Constructed) {
    //   // @ts-expect-error not sure about this approach but hey.
    //   entry.Constructed = entry.Constructed.split(', ');
    // }

    // if (tokenMap[entry.Name]) {
    //   // Debug unused tokens
    //   // (tokenMap[entry.Name] as any).used = true;

    //   entry.tokens = tokenMap[entry.Name];

    //   // if (["HC8.0", "HC8.1"].includes(entry.Set)) {
    //   //   console.log(entry.Name);
    //   // }
    // }

    // if (
    //   entry["Text Box"]?.find((e) => e?.includes(" token")) &&
    //   !entry.tokens &&
    //   entry.Set === "HC6"
    // ) {
    //   console.log(
    //     entry.Name +
    //       "  " +
    //       /[^ ]+ [^ ]+ token/.exec(entry["Text Box"].join(","))![0],
    //   );
    // }
  });

  const types = Array.from(typeSet);
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
    if (a.layout != b.layout) {
      if (
        HCLayoutGroup.TokenLayout.indexOf(a.layout as HCLayoutGroup.TokenLayoutType) >
        HCLayoutGroup.TokenLayout.indexOf(b.layout as HCLayoutGroup.TokenLayoutType)
      ) {
        return 1;
      }
      return -1;
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
    './src/data/types.json',
    JSON.stringify(
      {
        data: types.sort((a, b) => {
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
    './src/data/tokens.json',
    JSON.stringify(
      {
        data: addToJSONToCards(finalTokens),
      },
      null,
      '\t'
    )
  );
  fs.writeFileSync(
    './src/data/tags.json',
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
    './src/data/creators.json',
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
    './src/data/Hellscube-Database.json',
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
