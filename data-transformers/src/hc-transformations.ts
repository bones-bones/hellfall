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
} from '../../src/api-types/Card';
import { HCObject } from '../../src/api-types/Object';
import { getDefaultStore } from 'jotai';
import { loadPips, pipsAtom } from '../../src/hellfall/pipsAtom';
import { getColorIdentityProps } from '../../src/hellfall/getColorIdentity';

// TODO: make sure all_parts doesn't keep duplicates (maybe do it at the same time as sorting it?)
// TODO: hard sort the property order in a logical way
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
];
const oneWayDontMergeProps = ['color_identity', 'color_identity_hybrid', 'layout'];
const moveArraysToBottom = (cards: HCCard.Any[]): HCCard.Any[] => {
  return cards.map(card => {
    if ('card_faces' in card && 'all_parts' in card) {
      const { card_faces, all_parts, ...rest } = card;
      return { ...rest, card_faces, all_parts } as HCCard.AnyMultiFaced;
    }
    if ('card_faces' in card) {
      const { card_faces, ...rest } = card;
      return { ...rest, card_faces } as HCCard.AnyMultiFaced;
    }
    if ('all_parts' in card) {
      const { all_parts, ...rest } = card;
      return { ...rest, all_parts } as HCCard.AnySingleFaced;
    }
    return card;
  });
};
const setDerivedProps = (card: HCCard.Any) => {
  if ('card_faces' in card) {
    const type_line_list: string[] = [];
    const mana_cost_list: string[] = [];
    card.card_faces.forEach(face => {
      const face_type = [
        face.supertypes?.join(' '),
        [face.types?.join(' '), face.subtypes?.join(' ')].filter(Boolean).join(' — '),
      ]
        .filter(Boolean)
        .join(' ') as string;
      face.type_line = face_type;
      type_line_list.push(face_type);
      mana_cost_list.push(face.mana_cost);
    });
    card.type_line = type_line_list.join(' // ');
    card.mana_cost = mana_cost_list.filter(e => e).join(' // ');
  } else {
    card.type_line = [
      card.supertypes?.join(' '),
      [card.types?.join(' '), card.subtypes?.join(' ')].filter(Boolean).join(' — '),
    ]
      .filter(Boolean)
      .join(' ') as string;
  }
  const { color_identity, color_identity_hybrid } = getColorIdentityProps(card);
  card.color_identity = color_identity;
  card.color_identity_hybrid = color_identity_hybrid;
};
/**
 *
 * @param existingCard The card from the stored database JSON
 * @param newCard The card from the google sheet
 * @returns
 */
const mergeCards = (existingCard: HCCard.Any, newCard: HCCard.Any): HCCard.Any => {
  const merged: HCCard.Any = { ...existingCard };
  Object.entries(newCard).forEach(([key, value]) => {
    // TODO: make sure that empty arrays being truthy doesn't break anything here
    if (value) {
      if (
        key === 'card_faces' &&
        Array.isArray(value) &&
        'card_faces' in merged &&
        'card_faces' in existingCard &&
        'card_faces' in newCard
      ) {
        merged.card_faces = existingCard.card_faces.map((face, index) => {
          // if (!('colors' in face && face.colors)) {
          //   const x = 1;
          // }
          if (index < value.length) {
            const newFace = newCard.card_faces?.[index];
            if (!('colors' in newFace && newFace.colors)) {
              const x = 1;
            }
            // if (existingCard.card_faces.length > 4 && index == 3) {
            //   // this is necessary due to how the sheet is formatted
            //   // TODO: store current version and print the diff if there is one
            // } else {
            Object.entries(newFace).forEach(([k, v]) => {
              if (k in face && ['name', 'oracle_text', 'flavor_text'].includes(k)) {
                if (face[k as keyof typeof face]![0] == ';') {
                  // TODO: store current version and print the diff if there is one
                } else if (v) {
                  (face as any)[k] = v;
                }
              } else if (k == 'colors') {
                // TODO: store current version and print the diff if there is one
                // if (index == 0) {
                // (merged as any)[k] = v;
                // (face as any)[k] = v;
                // }
              } else if (k == 'image_status') {
                // TODO: store current version and print the diff if there is one
                if (
                  face.image_status == HCImageStatus.Missing ||
                  face.image_status ==
                    HCImageStatus.Inapplicable /*  || face.image_status == HCImageStatus.Split */
                ) {
                  (face as any)[k] = v;
                }
              } else if (v) {
                (face as any)[k] = v;
              }
            });
            // }
          }
          return face;
        });
        // TODO: Is this necessary?
        while (merged.card_faces.length < newCard.card_faces.length) {
          merged.card_faces.push(newCard.card_faces[merged.card_faces.length]);
        }
      } else if (
        'card_faces' in merged &&
        !('card_faces' in newCard) &&
        oneWayMergeProps.includes(key)
      ) {
        merged.card_faces[0][key as keyof HCCardFace.MultiFaced] != value;
      } else if (
        'card_faces' in merged &&
        !('card_faces' in newCard) &&
        oneWayDontMergeProps.includes(key)
      ) {
        // TODO: store current version and print the diff if there is one
      } else if (key == 'draft_image_status') {
        // TODO: store current version and print the diff if there is one
        if (
          merged.draft_image_status == HCImageStatus.Missing ||
          merged.draft_image_status ==
            HCImageStatus.Inapplicable /*  || face.image_status == HCImageStatus.Split */
        ) {
          (merged as any)[key] = value;
        }
      } else if (['subtypes', 'oracle_text', 'colors'].includes(key) && merged.isActualToken) {
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
        merged.all_parts = existingCard.all_parts?.map(part => {
          const newPart = newCard.all_parts?.find(
            e => e.name.toLowerCase() == part.name.toLowerCase()
          );
          if (newPart) {
            Object.entries(newPart).forEach(([k, v]) => {
              if (['name', 'component', 'is_draft_partner'].includes(k) && v) {
                (part as any)[k] = v;
              }
            });
          }
          return part;
        });
        newCard.all_parts?.forEach(part => {
          if (!merged.all_parts?.find(e => e.name.toLowerCase() == part.name.toLowerCase())) {
            merged.all_parts?.push(part);
          }
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
          !('card_faces' in newCard) &&
          (merged.layout == HCLayout.Normal || merged.layout == HCLayout.Token)
        ) {
          merged.layout = value as typeof newCard.layout;
        } else if ('card_faces' in merged && 'card_faces' in newCard && merged.layout != HCLayout.RealCardMultiToken) {
          merged.layout = value as typeof newCard.layout;
        }
      } else if (!['keywords', 'variation'].includes(key)) {
        (merged as any)[key] = value;
      }
    }
  });
  if (merged.variation && parseInt(merged.variation_of!)) {
    merged.variation_of = merged.name + merged.variation_of;
  }
  // handle adding card_faces (make sure this works)
  if (!('card_faces' in merged) && 'card_faces' in newCard) {
    const removeProps = [
      'color_indicator',
      'supertypes',
      'types',
      'subtypes',
      'power',
      'toughness',
      'loyalty',
      'defense',
      'oracle_text',
      'flavor_text',
    ];
    removeProps.forEach(prop => {
      if (prop in merged) {
        delete merged[prop as keyof typeof merged];
      }
    });
    const mergedFaces = merged as unknown as HCCard.AnyMultiFaced;
    mergedFaces.layout = merged.layout == HCLayout.Normal ? HCLayout.Multi : HCLayout.MultiToken;
    mergedFaces.card_faces = newCard.card_faces;
    setDerivedProps(mergedFaces);
    return mergedFaces;
  } else {
    setDerivedProps(merged);
    return merged;
  }
};
const mergeDatabases = (
  existingCards: HCCard.Any[],
  newCards: HCCard.Any[],
  existingTokens: HCCard.Any[],
  newTokens: HCCard.Any[]
): { mergedCards: HCCard.Any[]; mergedTokens: HCCard.Any[] } => {
  const newCardMap = new Map(newCards.map(card => [card.id, card]));
  const newTokenMap = new Map(newTokens.map(token => [token.id, token]));

  const mergedCards = existingCards.map(existingCard => {
    const newCard = newCardMap.get(existingCard.id);
    if (newCard) {
      newCardMap.delete(newCard.id);
      return mergeCards(existingCard, newCard);
    }
    return existingCard;
  });
  mergedCards.push(...Array.from(newCardMap.values()));

  const mergedTokens = existingTokens.map(existingToken => {
    const newToken = newTokenMap.get(existingToken.id);
    if (newToken) {
      newTokenMap.delete(newToken.id);
      return mergeCards(existingToken, newToken);
    }
    return existingToken;
  });
  mergedTokens.push(...Array.from(newTokenMap.values()));

  return { mergedCards, mergedTokens };
};
const dataToCards = (cards:any,missingProp:string='', missingPropValue:any='', addTo:''|'cards'|'faces'|'parts'='') => {
  switch (addTo) {
    case '':
      return cards as HCCard.Any[]
    case 'cards':
      return cards.map((card: any) => {
        if (!(missingProp in card)) {
          return {
            ...card,
            [missingProp]: missingPropValue
          } as HCCard.Any;
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
    case 'faces':
      return cards.map((card: any) => {
        if ('card_faces' in card) {
          card.card_faces=card.card_faces.map((face:any) =>{
            if (!(missingProp in face)) {
              return {
                ...face,
                [missingProp]: missingPropValue
              } as HCCardFace.MultiFaced;
            }
            return face as HCCardFace.MultiFaced;
          })
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
    case 'parts':
      return cards.map((card: any) => {
        if ('all_parts' in card) {
          card.all_parts=card.all_parts.map((part:any) =>{
            if (!(missingProp in part)) {
              return {
                ...part,
                [missingProp]: missingPropValue
              } as HCRelatedCard;
            }
            return part as HCRelatedCard;
          })
        }
        return card as HCCard.Any;
      }) as HCCard.Any[];
  }
}
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

    const existingCards = databaseContent ? dataToCards(databaseContent.data.filter((e:any)=>e.set!='HCT') || [],'set','','parts'):[];

    try {
      if (fs.existsSync(tokensPath)) {
        tokensContent = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
      }
    } catch (error) {
      console.warn('Could not load tokens, proceeding with undefined content:', error);
    }
    
    const existingTokens = tokensContent ? dataToCards(tokensContent.data || [],'set','','parts'):[];
    return { existingCards, existingTokens};
};
const main = async () => {
  const store = getDefaultStore();
  const pips = await loadPips();
  store.set(pipsAtom, pips);

  const { data: newCards } = { data: await fetchDatabase() };
  const usernameMappings = await fetchUsernameMappings();
  const tokenExcludedIds = ['the first pick1'];
  const newTokens = (await fetchTokens()).filter(e => !tokenExcludedIds.includes(e.id));
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
      const relatedToken: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: token.id,
        component: 'token',
        name: token.name,
        type_line: token.type_line,
        set:token.set,
        image: token.image,
      };
      token.all_parts
        ?.filter(e => e.component == 'token_maker')
        .forEach(tokenMaker => {
          const relatedCard = finalCards.find(card =>
            tokenMaker.id
              ? card.id == tokenMaker.id
              : card.name.toLowerCase() == tokenMaker.name.toLowerCase()
          );
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
          } else {
            const related = finalTokens.find(otherToken =>
              tokenMaker.id
                ? otherToken.id == tokenMaker.id
                : otherToken.name.toLowerCase() == tokenMaker.name.toLowerCase()
            );
            if (related) {
              tokenMaker.id = related.id;
              tokenMaker.name = related.name;
              tokenMaker.type_line = related.type_line;
              tokenMaker.set = related.set;
              tokenMaker.image = related.image;
              if ('all_parts' in related) {
                const tokenIndex = related.all_parts?.findIndex(e => e.id == token.id);
                if (tokenIndex == -1) {
                  related.all_parts?.push(relatedToken);
                } else {
                  related.all_parts![tokenIndex!] = relatedToken;
                }
              } else {
                related.all_parts = [relatedToken];
              }
            }
          }
        });
      const relatedTokenMaker: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: token.id,
        component: 'token_maker',
        name: token.name,
        type_line: token.type_line,
        set: token.set,
        image: token.image,
      };
      token.all_parts
        ?.filter(e => e.component == 'token')
        .forEach(subToken => {
          const related = finalTokens.find(otherToken =>
            subToken.id
              ? otherToken.id == subToken.id
              : otherToken.name.toLowerCase() == subToken.name.toLowerCase()
          );
          if (related) {
            subToken.id = related.id;
            subToken.name = related.name;
            subToken.type_line = related.type_line;
            subToken.set = related.set;
            subToken.image = related.image;
            if ('all_parts' in related) {
              const tokenIndex = related.all_parts?.findIndex(e => e.id == token.id);
              if (tokenIndex == -1) {
                related.all_parts?.push(relatedTokenMaker);
              } else {
                related.all_parts![tokenIndex!] = relatedTokenMaker;
              }
            } else {
              related.all_parts = [relatedTokenMaker];
            }
          }
        });
      const meldPartIds: string[] = [];
      const meldRelatedCards: HCRelatedCard[] = [];
      token.all_parts
        ?.filter(e => e.component == 'meld_part')
        .forEach(meldPart => {
          const relatedCard = finalCards.find(card =>
            meldPart.id
              ? card.id == meldPart.id
              : card.name.toLowerCase() == meldPart.name.toLowerCase()
          );
          if (relatedCard) {
            meldPart.id = relatedCard.id;
            meldPartIds.push(relatedCard.id);
            meldPart.name = relatedCard.name;
            meldPart.type_line = relatedCard.type_line;
            meldPart.set = relatedCard.set;
            meldPart.image =
              'card_faces' in relatedCard ? relatedCard.card_faces[0].image : relatedCard.image;
            meldPart.is_draft_partner = true;
            meldRelatedCards.push(meldPart);
            // } else {
            //   const related = finalTokens.find(otherToken => tokenMaker.id ? otherToken.id == tokenMaker.id : otherToken.name == tokenMaker.name);
            //   if (related){
            //     tokenMaker.id = related.id;
            //     tokenMaker.name = related.name;
            //     tokenMaker.type_line = related.type_line;
            //     if ('all_parts' in related) {
            //       const tokenIndex = related.all_parts?.findIndex(e => e.id == token.id);
            //       if (tokenIndex == -1) {
            //         related.all_parts?.push(relatedToken);
            //       } else {
            //         related.all_parts![tokenIndex!] = relatedToken;
            //       }
            //     } else {
            //       related.all_parts = [relatedToken];
            //     }
            //   }
          }
        });
      if (meldPartIds && meldPartIds.length) {
        const meldResult: HCRelatedCard = {
          object: HCObject.ObjectType.RelatedCard,
          id: token.id,
          component: 'meld_result',
          name: token.name,
          type_line: token.type_line,
          set:token.set,
          image: token.image,
        };
        meldRelatedCards.push(meldResult);
        meldPartIds.forEach(id => {
          const relatedCard = finalCards.find(card => card.id == id);
          if (!('has_draft_partners' in relatedCard!)) {
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
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      const relatedToken: HCRelatedCard = {
        object: HCObject.ObjectType.RelatedCard,
        id: card.id,
        component: 'token_maker',
        name: card.name,
        type_line: card.type_line,
        set: card.set,
        image: card.image,
      };
      card.all_parts
        ?.filter(e => e.component == 'token')
        .forEach(tokenCard => {
          const relatedCard = finalCards.find(e =>
            tokenCard.id
              ? e.id == tokenCard.id
              : e.name.toLowerCase() == tokenCard.name.toLowerCase()
          );
          if (relatedCard) {
            tokenCard.id = relatedCard!.id;
            tokenCard.name = relatedCard!.name;
            tokenCard.type_line = relatedCard!.type_line;
            tokenCard.set = relatedCard!.set;
            tokenCard.image = relatedCard!.image;
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
            partnerCard.id
              ? e.id == partnerCard.id
              : e.name.toLowerCase() == partnerCard.name.toLowerCase()
          );
          // if (relatedCard) {
          if (!('has_draft_partners' in relatedCard!)) {
            relatedCard!.has_draft_partners = true;
          }
          partnerCard.id = relatedCard!.id;
          partnerCard.name = relatedCard!.name;
          partnerCard.type_line = relatedCard!.type_line;
          partnerCard.set = relatedCard!.set;
          partnerCard.image = relatedCard!.image;
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
          // }
        });
    });
  finalCards
    .filter(e => 'all_parts' in e)
    .forEach(card => {
      card.all_parts?.forEach(storedRelated => {
        const relatedCard = finalCards.find(e => e.id == storedRelated.id);
        if (relatedCard) {
          storedRelated.id = relatedCard.id;
          storedRelated.name = relatedCard.name;
          storedRelated.type_line = relatedCard.type_line;
          storedRelated.set = relatedCard.set;
          storedRelated.image = relatedCard.image;
        }
      });
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

    replaceLoop: for (const [replacementName, oldNames] of usernameMappingEntries) {
      for (const oldName of oldNames) {
        if (entry.creator.split(';').includes(oldName)) {
          entry.creator = entry.creator.replace(oldName, replacementName);
          break replaceLoop;
        }
      }
    }

    creatorSet.add(entry.creator);

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
  // const tokenLayoutOrder = [
  //   HCLayout.Token,
  //   HCLayout.MultiToken,
  //   HCLayout.Emblem,
  //   HCLayout.MeldResult,
  // ];
  finalTokens.sort((a, b) => {
    if (a.layout != b.layout) {
      if (
        HCLayoutGroup.TokenLayout.indexOf(a.layout as HCLayoutGroup.TokenLayoutType) >
        HCLayoutGroup.TokenLayout.indexOf(b.layout as HCLayoutGroup.TokenLayoutType)
        // tokenLayoutOrder.indexOf(a.layout as HCLayout) >
        // tokenLayoutOrder.indexOf(b.layout as HCLayout)
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
        data: moveArraysToBottom(finalTokens),
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
        data: moveArraysToBottom(finalCards).concat(moveArraysToBottom(finalTokens)),
      },
      null,
      '\t'
    )
  );
};

main();
